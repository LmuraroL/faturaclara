import{t as s}from"./index-Ba4dGSDQ.js";function c(o){return o.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}function l(){const o=s().split(`
`),e=["BT","/F1 9 Tf","50 780 Td"];return o.forEach((t,a)=>{a>0&&e.push("0 -12 Td"),e.push(`(${c(t.slice(0,92))}) Tj`)}),e.push("ET"),e.join(`
`)}function p(){const o=l(),e=["1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj","2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj","3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",`4 0 obj << /Length ${o.length} >> stream
${o}
endstream endobj`,"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj"];let t=`%PDF-1.4
`;const a=[0];for(const n of e)a.push(t.length),t+=`${n}
`;const r=t.length;t+=`xref
0 ${e.length+1}
`,t+=`0000000000 65535 f 
`;for(let n=1;n<=e.length;n++)t+=`${String(a[n]).padStart(10,"0")} 00000 n 
`;return t+=`trailer << /Size ${e.length+1} /Root 1 0 R >>
startxref
${r}
%%EOF
`,new Blob([t],{type:"application/pdf"})}function i(){const o=URL.createObjectURL(p()),e=document.createElement("a");e.href=o,e.download="fatura-exemplo-faturaclara.pdf",e.click(),URL.revokeObjectURL(o)}export{i as baixarPdfExemplo,p as blobPdfExemplo};
