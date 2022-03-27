export const patinlinenote=/([)၊။' \u1000-\u103f\u104c-\u108f])([၀၁၂၃၄၅၆၇၈၉]+)([\-။၊' \u1000-\u103f\u104c-\u108f])?/g;
export const patfootnote=/([\-၀၁၂၃၄၅၆၇၈၉]+)။/;
export const patpidx=/<span class="paragraph">([၀၁၂၃၄၅၆၇၈၉\-]+)<\/span>။/

export const newbookname={
    '01_vinaya_01':'pj','01_vinaya_02':'pc','01_vinaya_03':'mv','01_vinaya_04':'cv','01_vinaya_05':'pvr',
    '02_digha_01':'dn1','02_digha_02':'dn2','02_digha_03':'dn3',
    '03_majjhima_01':'mn1','03_majjhima_02':'mn2','03_majjhima_03':'mn3',
    '04_sanyutta_01':'sn1','04_sanyutta_02':'sn2','04_sanyutta_03':'sn3','04_sanyutta_04':'sn4','04_sanyutta_05':'sn5',
    '05_anguttara_01':'an1','05_anguttara_02':'an2','05_anguttara_03':'an3','05_anguttara_04':'an4','05_anguttara_05':'an5',
    '05_anguttara_06':'an6','05_anguttara_07':'an7','05_anguttara_08':'an8','05_anguttara_09':'an9','05_anguttara_10':'an10',
    '05_anguttara_11':'an11',
    '06_khuddaka_01':'kp','06_khuddaka_02':'dhp','06_khuddaka_03':'ud','06_khuddaka_04':'iti','06_khuddaka_05':'snp',
    '06_khuddaka_06':'vv','06_khuddaka_07':'pv','06_khuddaka_08':'thap','06_khuddaka_09':'thip','06_khuddaka_10':'bv',
    '06_khuddaka_11':'cp','06_khuddaka_12':'ps','06_khuddaka_13':'mil',
    
    //論只有一部ok
    //missing thag,thig, ja,mnd,cnd ne,pe
    '07_abhidhamma_01':'ds', //太多數字無法和注釋號區分
    '07_abhidhamma_02':'vb', //太多數字無法和注釋號區分
    '07_abhidhamma_03':'pp', //remove class=paragaph within div class=list
    '07_abhidhamma_05':'kv', //ok
    //missing  ya dt pt
}
export const html2tag={h1:'chapter',h2:'subhead',h3:'subhead2',h4:'subhead3',h5:'subhead4',h6:'subhead5'};
