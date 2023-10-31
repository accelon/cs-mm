const Tokens={};

const tokenStat=t=>{
    t.replace(/([\u1000-\u103f\u104c-\u108f]+)/g,(m,m1)=>{
        if (!Tokens[m1]) Tokens[m1]=0;
        Tokens[m1]++;
    })
}

const statResult=()=>{
    const out=[];
    for (let tk in Tokens) {
        out.push([Tokens[tk],tk]);
    }
    out.sort((a,b)=>b[0]-a[0])
    return out;
}
export default {tokenStat,statResult};