/* gen myanmar translation of Mula*/
import {readTextLines, nodefs, writeChanged } from "ptk/nodebundle.cjs";
import {filefix,parafix,ignoreNote, ignoreReuse} from './errata.js';
import {newbookname,html2tag,patfootnote,patinlinenote,patpidx} from './constant.js';

await nodefs;
const folder='./Books/' // ren mm.pndaza  apk to zip , extract Books from assets
const outfolder='books'
const lst=readTextLines('./mm.lst');
const filter=process.argv[2];
// const {tokenStat,statResult}=require('./mm-stat');

let rawcontent='';
const toArabic=t=>{
    let s='';
    for (let i=0;i<t.length;i++) {
        if (t.charAt(i)=='-') s+='-';
        else s+=String.fromCharCode(t.charCodeAt(i)-0x1040+0x30);
    }
    return s;
}
const checkParaFix=()=>{
    for (let fn in parafix) {
        for (let i=0;i<parafix[fn].length;i++) {
            if (!parafix[fn][i][2]) {
                logError(0,'unconsumed fix '+parafix[fn][i])
            } 
        }
    }
}
const applyParaFix=(l,fn,pn,lineidx)=>{
    if (!parafix[fn] || !parafix[fn][pn]) {
        l=l.replace('</span>-<span class="paragraph">','-');
        return l;
    }
    let fix=parafix[fn][pn];
       
    if (!Array.isArray(fix[0]) && fix.length) {
        fix=[fix];
        parafix[fn][pn]=fix
    }
   
    for (let i=0;i<fix.length;i++) {
        const [from,to]=fix[i];
        const nl=l.replace(from,to);
        if (nl!==l) {
            // console.log('hot fix applied',fn,'pn',pn,'from',from,'to',to)
            l=nl;
            fix[i][2]=(fix[i][2]||0)+1;
            break;// apply only one fix per line
        }
    }
    // if (lineidx==1640) console.log('\n',l)

    l=l.replace('</span>-<span class="paragraph">','-'); 
    //cannot fix at the begining, because sanyutta_03.html :: 2057  pn611
    //wrong markup

    return l; 
}
const findFootMarks=(linetext,cb)=>{
    if (linetext.indexOf('class="footnote"')==-1) {
        linetext.replace(patinlinenote,(m,beforech,m1,afterch,offset)=>{                
            if (beforech=='-' || afterch==')' ||m1.length>3) return ;//not a note
            let n=parseInt(toArabic(m1));
            if (n>199) return ;
            cb(n,offset+1);
        });
    }
}

let curfn='';
const logError=(rawlineidx,msg)=>{
    console.log(curfn+'('+(parseInt(rawlineidx)+1)+')',msg);
}
const appendNoteToText=(footMarks,footNotes,textlines,html2out)=>{
    const out=[].concat(textlines);
    let startline=0,groups=[], notes={};
   
    //grouping footNotes
    for (let lineidx in footNotes) {
        const n=footNotes[lineidx];
        if (parseInt(n)==1) { //a new group
            if (Object.keys(notes).length) {
                groups.push({ startline ,notes} );
                notes={};
            }
            startline=parseInt(lineidx);
        }
        notes[ parseInt(n) ] = n;
    }
    groups.push( {startline,notes});

    //assign footnote to notemarker
    let ngroup=0;
    for (let lineidx in footMarks) {
        lineidx=parseInt(lineidx);
        while (ngroup<groups.length && groups[ngroup].startline < lineidx) ngroup++;
        if (ngroup>=groups.length) break;
        const g=groups[ngroup];
        const mk=footMarks[lineidx];
        for (let n in mk) {
            if (g.notes[ n ]) {
                mk[n]= g.notes[ n ].substr(n.toString().length+1) ;
            } else {
                logError(g.startline,'footnote without marker '+n);
            }
        }
    }
    //patching rawtext
    for (let lineidx in footMarks) {
        const ln=html2out[parseInt(lineidx)];
        const markers=footMarks[lineidx];
        let notes=[];
        findFootMarks(out[ln],(n,offset)=>{
            if (!markers[n]) {
                logError(lineidx,'marker without footnote '+n);
            } else {                
                if (markers[n]=='=') {
                    const reuseok=(ignoreReuse[curfn]&&ignoreReuse[curfn].indexOf(parseInt(lineidx))>-1);
                   !reuseok&&logError(lineidx,'reuse footnote '+n);
                }
                notes.push(offset+'^'+markers[n]);
                markers[n]='=';//consumed, 下一個相同footmark不會重覆文字，見 dn3_28
            }
         })
        out[ln]+='|'+notes.join(' ');
    }
    return out;
}
const repunc=linetext=>{
    let i=0;
    linetext=linetext.replace(/''/g,m=>((i++)%2==0)?'“':'”');
    return linetext.replace(/'/g,m=>((i++)%2==0)?'‘':'’');
}
const dofile=fn=>{
    const newfn=newbookname[fn.replace('.html','').replace(';','')]

    if (filter&&newfn&&fn.replace('.html','').indexOf(filter)==-1
      &&newfn.indexOf(filter)==-1)return;
    if (!fs.existsSync(folder+fn))return;

    curfn=fn;
    let content=fs.readFileSync(folder+fn,'utf8').replace(/\r?\n/g,'\n').trim();
    (filefix[fn]||[]).forEach(fix=>{
        content=content.replace(fix[0],fix[1]);
    }) 
    const lines=content.split(/\r?\n/);
    let out=[];
    const footMarks={},footNotes={}; 
    let pn='',started=false,pb=0;
    let prevlinewithfootnote=''; //02_digha_03 foot note ၁-၂ 有兩段，合併之 
    const html2out={}; //html line to output line

    const handlePB=line=>{
        if (!line)return true;
        if (line=='--') {
            pb++;
            if (filter) out[out.length-1]+=('=='+pb+'==');
            return true;
        }
    }




    const handleNormalP=l=>out.push(l);
    const handleClass=(classname,text,lineidx)=>{
        if (classname=='footnote') {           
            const numm=text.match(patfootnote);
            if (numm) {
                const n=parseInt(toArabic(numm[1]));
                footNotes[ lineidx ]=n+'.'+text;
                prevlinewithfootnote=lineidx;
            } else {
                footNotes[prevlinewithfootnote]+='\t'+text;
            }
        } else {
            out.push(classname+'|'+text);
        }
    }
    
    for (let i=0;i<lines.length-2;i++) { //last 2 lines are omitted
        if (!started) {started=(lines[i]=='<body>');continue}
        html2out[i]=out.length;
        let l=lines[i].replace(/<br\/>/g,'');

        l=applyParaFix(l,fn,pn,i);
        if (handlePB(l)) continue;
 
        l=l.replace(patpidx,(m,m1)=>{
            pn=toArabic(m1);
            return pn+'|';
        });
        if (l.indexOf('"paragraph"')>0) {
            debugger
            console.log('line has paragraph but not parsed',fn,i+1);
            console.log(l.substr(0,80))
        }

        l=repunc(l);


        ;(!(ignoreNote[fn]&&ignoreNote[fn][pn]))&&findFootMarks(l,n=>{  
                if (!footMarks[i]) footMarks[i]={};
                footMarks[i][n]=null; //to be fill
        });

        if (l.indexOf('<h')>-1) {
            const m=l.match(/<(h\d)>(.+?)<\/h\d>/);
            if (!m) throw 'header parse errorerror '+fn+' line '+(i+1)+' pn '+pn+' '+l;
            const tag=html2tag[m[1]];
            if (!tag) throw 'unknown markup '+l
            out.push(tag+'|'+m[2]);
        } else {
            const m=l.match(/class="([a-z]+)">(.+?)<\/p>/);
            const m2=l.match(/<p>(.+?)<\/p>/);
            if (m) {
                handleClass(m[1],m[2],i);
            } else if (m2){
                handleNormalP(m2[1]);
            } else {
                if (l) logError(i,'wrong line of pn'+pn +'==>'+l);
            }
        }
    } 

    out=appendNoteToText(footMarks,footNotes,out,html2out);

    if (filter) {
        const outcontent=out.join('\n');
        const outfn=outfolder+'/'+newfn+'.txt'
        if (writeChanged(outfn,outcontent)) {
            console.log('written',outfn,outcontent.length);
        }
        // fs.writeFileSync('footNotes.txt',JSON.stringify(footNotes),'utf8');
        // fs.writeFileSync('footMarks.txt',JSON.stringify(footMarks),'utf8');
    } else {
        rawcontent+=out.map((line,idx)=>newfn+'_x'+idx+'\t'+line).join('\n')+'\n';
    }

    // tokenStat(outcontent);

    checkParaFix();
}
console.clear();
lst.forEach(dofile)
console.log(rawcontent.length)
if (!filter && writeChanged('mm-raw.txt',rawcontent)) {
    console.log('written mm-raw.txt',rawcontent.length)
}
// fs.writeFileSync('mm-token.txt',statResult().join('\n'),'utf8')

