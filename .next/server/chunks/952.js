"use strict";exports.id=952,exports.ids=[952],exports.modules={3951:(t,e,a)=>{a.d(e,{TI:()=>d,mk:()=>r});var s=a(7070),_=a(6587);async function i(){return _.II}async function r(t){let e=await i();return e?e.is_active?t&&!t.includes(e.role)?s.NextResponse.json({error:`Access denied. Required role: ${t.join(" or ")}`},{status:403}):{user:e}:s.NextResponse.json({error:"Account is deactivated"},{status:403}):s.NextResponse.json({error:"Not authenticated"},{status:401})}function d(t){return t instanceof s.NextResponse}},6587:(t,e,a)=>{a.d(e,{$5:()=>c,C7:()=>v,DK:()=>i,GD:()=>m,GT:()=>o,II:()=>s,M_:()=>b,N9:()=>f,NP:()=>n,Pw:()=>u,U4:()=>d,af:()=>h,bk:()=>l,jc:()=>_,oI:()=>p,q9:()=>r,wI:()=>g});let s={id:"demo-user-123",email:"demo@pharma.local",full_name:"Demo User",role:"management",is_active:!0,created_at:"2026-01-01T00:00:00Z",updated_at:"2026-01-01T00:00:00Z"},_=[{id:"batch-1",batch_no:"BTH-26-0001",product_name:"Paracetamol 500mg",batch_size:1e3,batch_size_unit:"kg",current_stage:"qc_inprocess",grn_status:"done",disp_status:"done",bmr_status:"done",qc_ip_status:"pending",qc_fr_status:"pending",prod_status:"pending",fg_status:"pending",release_status:"pending",created_at:"2026-01-10T10:00:00Z",updated_at:"2026-01-15T11:00:00Z",created_by:"user-1"},{id:"batch-2",batch_no:"BTH-26-0002",product_name:"Ibuprofen 400mg",batch_size:800,batch_size_unit:"kg",current_stage:"release",grn_status:"done",disp_status:"done",bmr_status:"done",qc_ip_status:"passed",qc_fr_status:"passed",prod_status:"done",fg_status:"done",release_status:"approved",created_at:"2026-01-05T08:30:00Z",updated_at:"2026-01-20T15:00:00Z",created_by:"user-1"},{id:"batch-3",batch_no:"BTH-26-0003",product_name:"Aspirin 300mg",batch_size:500,batch_size_unit:"kg",current_stage:"grn",grn_status:"pending",disp_status:"pending",bmr_status:"pending",qc_ip_status:"pending",qc_fr_status:"pending",prod_status:"pending",fg_status:"pending",release_status:"pending",created_at:"2026-02-01T09:00:00Z",updated_at:"2026-02-01T09:00:00Z",created_by:"user-1"}],i=[{id:"bmr-1",bmr_no:"BMR-26-0001",batch_id:"batch-1",version:"v1.0",formula_ref:"FRM-2026-001",status:"approved",is_locked:!1,created_by:"user-1",created_at:"2026-01-12T11:00:00Z",updated_at:"2026-01-15T14:30:00Z"},{id:"bmr-2",bmr_no:"BMR-26-0002",batch_id:"batch-2",version:"v1.0",formula_ref:"FRM-2026-002",status:"approved",is_locked:!0,created_by:"user-1",created_at:"2026-01-08T09:15:00Z",updated_at:"2026-01-18T16:45:00Z"}],r=[{id:"bmrs-1-1",bmr_id:"bmr-1",section_no:"1",section_title:"Batch Identification & Traceability",content:"Batch BTH-26-0001 identified and traceable",is_completed:!0,sort_order:0},{id:"bmrs-1-2",bmr_id:"bmr-1",section_no:"2",section_title:"Formula & Theoretical Composition",content:"Formula reference FRM-2026-001 applied",is_completed:!0,sort_order:1}],d=[{id:"qc-1",qc_no:"QC-26-0001",batch_id:"batch-1",test_type:"in_process",test_date:"2026-01-13",analyst_name:"John Smith",analyst_id:"user-2",conclusion:"pass",status:"approved",submitted_by:"user-2",approved_by:"user-3",approved_at:"2026-01-14",is_locked:!1,created_by:"user-2",created_at:"2026-01-13T10:30:00Z",updated_at:"2026-01-14T11:00:00Z"},{id:"qc-2",qc_no:"QC-26-0002",batch_id:"batch-2",test_type:"final_release",test_date:"2026-01-19",analyst_name:"Jane Doe",analyst_id:"user-2",conclusion:"pass",status:"approved",submitted_by:"user-2",approved_by:"user-3",approved_at:"2026-01-20",is_locked:!0,created_by:"user-2",created_at:"2026-01-19T14:00:00Z",updated_at:"2026-01-20T15:00:00Z"}],o=[{id:"qtr-1",qc_record_id:"qc-1",test_name:"Appearance",specification:"White to off-white powder",result:"White powder",verdict:"pass",sort_order:0},{id:"qtr-2",qc_record_id:"qc-1",test_name:"Assay",specification:"98-102%",result:"99.5%",verdict:"pass",sort_order:1}],n=[{id:"fg-1",fg_no:"FG-26-0001",batch_id:"batch-2",date_entered:"2026-01-21",actual_qty:4500,unit:"tablets",yield_pct:95.2,pack_format:"2x15",total_units:300,storage_location:"A1-B2-C3",status:"qc_passed",entered_by:"user-4",entered_by_name:"Production Lead",created_at:"2026-01-21T09:00:00Z"}],c=[{id:"rel-1",release_no:"REL-26-0001",batch_id:"batch-2",qc_record_id:"qc-2",release_type:"unconditional",release_date:"2026-01-22",conditions:null,issued_by:"user-3",issued_by_name:"QA Regulatory Head",drap_ref:"DRAP-2026-001",status:"issued",created_at:"2026-01-22T11:30:00Z"}],l=[{id:"stab-1",study_no:"STAB-26-0001",batch_id:"batch-2",study_type:"long_term",start_date:"2026-01-22",protocol_ref:"STAB-PROT-001",conditions:["25\xb0C/60%RH"],planned_timepoints:[0,3,6,9,12,18,24],status:"ongoing",created_by:"user-2",created_at:"2026-01-22T13:00:00Z"}],p=[{id:"stap-1",study_id:"stab-1",parameter_name:"Assay",specification:"90-110%",sort_order:0}],b=[{id:"star-1",study_id:"stab-1",timepoint:0,result:"100.0%",status:"pass",created_at:"2026-01-22T14:00:00Z"}],u=[{id:"grn-1",grn_no:"GRN-26-0001",batch_id:"batch-1",supplier:"ChemSource Ltd",received_date:"2026-01-10",received_by:"user-5",received_by_name:"Warehouse Manager",quantity:5e3,unit:"kg",status:"approved",approved_by:"user-1",approval_date:"2026-01-11",is_locked:!1,created_at:"2026-01-10T08:00:00Z"}],h=[{id:"disp-1",dispensing_no:"DISP-26-0001",batch_id:"batch-1",dispatch_date:"2026-01-11",dispatched_by:"user-5",dispatched_by_name:"Warehouse Manager",received_by:"user-6",received_by_name:"Production Lead",quantity:5e3,unit:"kg",status:"completed",location_from:"A1-B2-C1",location_to:"P1-M1-S1",created_at:"2026-01-11T10:00:00Z"}],v=[{id:"prod-1",production_no:"PROD-26-0001",batch_id:"batch-1",start_date:"2026-01-12",end_date:"2026-01-15",shift_lead:"user-6",shift_lead_name:"Production Lead",status:"completed",line_used:"Line A",notes:"Production completed successfully",created_at:"2026-01-12T06:00:00Z"}],m=[{id:"audit-1",user_id:"user-2",action:"CREATE",entity_type:"qc_records",entity_id:"qc-1",entity_display:"QC-26-0001",old_values:null,new_values:{testType:"in_process",conclusion:"pass"},created_at:"2026-01-13T10:30:00Z"},{id:"audit-2",user_id:"user-3",action:"APPROVE",entity_type:"qc_records",entity_id:"qc-1",entity_display:"QC-26-0001",old_values:{status:"submitted"},new_values:{status:"approved"},created_at:"2026-01-14T15:00:00Z"}],g=[{id:"grni-1",grn_id:"grn-1",item_no:1,material_code:"RAW-001",material_name:"Paracetamol USP",specification:"PH.EUR",received_qty:5e3,unit:"kg",accepted_qty:5e3,rejected_qty:0,batch_no:"RAW-BH-001",expiry_date:"2027-06-30",certificate_of_analysis:"COA-001",status:"accepted",sort_order:0}],f=[{id:"notif-1",user_id:"user-1",title:"QC Report Pending Approval",message:"QC-26-0001 is awaiting your approval",type:"approval_needed",related_entity_type:"qc_records",related_entity_id:"qc-1",is_read:!1,created_at:"2026-01-13T11:00:00Z"}]},7952:(t,e,a)=>{a.d(e,{KI:()=>l,ib:()=>c,wK:()=>p});var s=a(7070),_=a(5655),i=a(3951);let r=process.env.NEXT_PUBLIC_COMPANY_NAME??"M.A. Kamil Farma (Pvt.) Ltd.",d=process.env.NEXT_PUBLIC_DRAP_LICENSE??"DRAP License No. VET-MFG-XXXX",o=`
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;padding:24px;background:#fff}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:14px}
  .co{font-size:15px;font-weight:700}.sub{font-size:9px;color:#555;margin-top:2px}
  .doc-title{font-size:13px;font-weight:700;text-align:center;background:#f0f0f0;padding:6px;border:1px solid #bbb;margin-bottom:14px;letter-spacing:.8px}
  h3{font-size:10px;font-weight:700;border-bottom:1px solid #ccc;padding-bottom:3px;margin:14px 0 6px;letter-spacing:.5px;text-transform:uppercase}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10px}
  th{background:#e5e5e5;padding:4px 7px;border:1px solid #bbb;font-weight:700;text-align:left}
  td{padding:3px 7px;border:1px solid #bbb;vertical-align:top}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-bottom:12px}
  .kv label{font-size:8px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .kv span{display:block;font-size:11px;font-weight:600;margin-top:1px}
  .pass{color:#1a7a38;font-weight:700}.fail{color:#c00;font-weight:700}
  .sig-row{display:flex;gap:16px;margin-top:22px}
  .sig-box{flex:1;border-top:1px solid #000;padding-top:5px;font-size:9px;color:#555}
  .footer{margin-top:18px;border-top:1px solid #ccc;padding-top:6px;font-size:9px;color:#888;display:flex;justify-content:space-between}
  .verdict-box{padding:10px;border:2px solid #ccc;background:#f9f9f9;margin:10px 0;text-align:center;font-weight:700;font-size:12px}
  .pass-box{border-color:#2d8a48;background:#e8f5e8;color:#1a5c30}
  .fail-box{border-color:#c00;background:#ffeaea;color:#900}
`;function n(t,e){return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t}</title>
  <style>${o}</style></head><body>
  ${e}
  <div class="footer"><span>${r} \xb7 ${d}</span><span>Generated: ${new Date().toLocaleString()}</span></div>
  </body></html>`}async function c(t){let e=await (0,i.mk)();if((0,i.TI)(e))return e;let{batchId:a}=await t.json(),o=(0,_.e)(),[c,l,p,b]=await Promise.all([o.from("batches").select("*").eq("id",a).single(),o.from("grns").select("*, items:grn_items(*)").eq("batch_id",a),o.from("dispensing_records").select("*, items:dispensing_items(*)").eq("batch_id",a),o.from("bmrs").select("*, sections:bmr_sections(*)").eq("batch_id",a).order("created_at",{ascending:!1}).limit(1).single()]),u=c.data,h=b.data;if(!u)return s.NextResponse.json({error:"Batch not found"},{status:404});let v=(l.data??[]).flatMap(t=>(t.items??[]).map(e=>`<tr><td>${t.grn_no}</td><td>${e.material_name}</td><td>${e.quantity} ${e.unit}</td><td>${e.supplier_lot_no??"—"}</td><td>${e.exp_date??"—"}</td><td>${e.coa_reference??"—"}</td></tr>`)).join("")||'<tr><td colspan="6" style="color:#888;font-style:italic">No GRN records</td></tr>',m=(p.data??[]).flatMap(t=>(t.items??[]).map(e=>{let a=(e.dispensed_qty-e.required_qty).toFixed(3),s=!1!==e.deviation_acceptable;return`<tr><td>${t.disp_no}</td><td>${e.material_name}</td><td>${e.required_qty}</td><td><strong>${e.dispensed_qty}</strong></td><td>${e.unit}</td><td>${parseFloat(a)>=0?"+":""}${a}</td><td class="${s?"pass":"fail"}">${s?"OK":"DEVIATION"}</td></tr>`})).join("")||'<tr><td colspan="7" style="color:#888;font-style:italic">No dispensing records</td></tr>',g=(h?.sections??[]).sort((t,e)=>t.sort_order-e.sort_order).map(t=>`<tr><td>${t.section_title}</td><td style="text-align:center">${t.is_completed?"✓":""}</td><td>${t.operator_sign??""}</td><td>${t.completed_at?new Date(t.completed_at).toLocaleDateString():""}</td></tr>`).join(""),f=n(`BMR — ${u.batch_no}`,`
    <div class="hdr">
      <div><div class="co">${r}</div><div class="sub">${d}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: BATCH MANUFACTURING RECORD</div>
        <div>Batch No.: <strong>${u.batch_no}</strong></div>
        <div>BMR Ref.: ${h?.bmr_no??"—"} \xb7 Version: ${h?.version??"—"}</div>
      </div>
    </div>
    <div class="doc-title">BATCH MANUFACTURING RECORD (EXECUTED)</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${u.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${u.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${u.batch_size??"—"} ${u.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${u.mfg_date??"—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${u.exp_date??"—"}</span></div>
      <div class="kv"><label>Formula Reference</label><span>${h?.formula_ref??"—"}</span></div>
    </div>
    <h3>Section A — Goods Receipt (Raw Materials)</h3>
    <table><thead><tr><th>GRN No.</th><th>Material</th><th>Qty</th><th>Lot No.</th><th>Exp Date</th><th>COA Ref.</th></tr></thead><tbody>${v}</tbody></table>
    <h3>Section B — Dispensing Record</h3>
    <table><thead><tr><th>Disp. No.</th><th>Material</th><th>Required</th><th>Dispensed</th><th>Unit</th><th>Deviation</th><th>Status</th></tr></thead><tbody>${m}</tbody></table>
    <h3>Section C — BMR Execution Checklist</h3>
    <table><thead><tr><th style="width:60%">Section</th><th style="width:8%">Done</th><th>Operator</th><th>Date</th></tr></thead><tbody>${g}</tbody></table>
    <div class="sig-row">
      <div class="sig-box">Production Operator<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
      <div class="sig-box">Production Supervisor<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
      <div class="sig-box">QA Officer (Review)<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
    </div>
  `);return new s.NextResponse(f,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="BMR-${u.batch_no}.html"`}})}async function l(t){let e=await (0,i.mk)();if((0,i.TI)(e))return e;let{batchId:a}=await t.json(),o=(0,_.e)(),[c,l,p]=await Promise.all([o.from("batches").select("*").eq("id",a).single(),o.from("qc_records").select("*, test_results:qc_test_results(*)").eq("batch_id",a).order("created_at",{ascending:!1}),o.from("release_records").select("*").eq("batch_id",a).limit(1).single()]),b=c.data;if(!b)return s.NextResponse.json({error:"Batch not found"},{status:404});let u=(l.data??[]).filter(t=>"in_process"===t.test_type),h=(l.data??[]).filter(t=>"final_release"===t.test_type),v=[...u,...h].every(t=>"pass"===t.conclusion),m=t=>0===t.length?'<tr><td colspan="5" style="color:#888;font-style:italic">No records</td></tr>':t.flatMap(t=>(t.test_results??[]).map(t=>`<tr><td>${t.parameter}</td><td>${t.specification}</td><td><strong>${t.result??"—"}</strong></td><td>${t.unit??"—"}</td><td class="${"pass"===t.verdict?"pass":"fail"}">${String(t.verdict??"").toUpperCase()}</td></tr>`)).join(""),g=n(`CoA — ${b.batch_no}`,`
    <div class="hdr">
      <div><div class="co">${r}</div><div class="sub">${d}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: CERTIFICATE OF ANALYSIS</div>
        <div>Batch No.: <strong>${b.batch_no}</strong></div>
        <div>Issue Date: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
    <div class="doc-title">CERTIFICATE OF ANALYSIS</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${b.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${b.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${b.batch_size??"—"} ${b.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${b.mfg_date??"—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${b.exp_date??"—"}</span></div>
      <div class="kv"><label>Storage Conditions</label><span>Store below 25\xb0C, protect from light</span></div>
    </div>
    <h3>In-Process Quality Control Results</h3>
    <table><thead><tr><th>Test Parameter</th><th>Specification</th><th>Result</th><th>Unit</th><th>Verdict</th></tr></thead><tbody>${m(u)}</tbody></table>
    <h3>Final Release Quality Control Results</h3>
    <table><thead><tr><th>Test Parameter</th><th>Specification</th><th>Result</th><th>Unit</th><th>Verdict</th></tr></thead><tbody>${m(h)}</tbody></table>
    <div class="verdict-box ${v?"pass-box":"fail-box"}">
      ${v?"✓ BATCH COMPLIES WITH ALL SPECIFICATIONS — CERTIFIED FOR RELEASE":"✗ BATCH DOES NOT COMPLY — INVESTIGATION / DEVIATION REQUIRED"}
    </div>
    <div class="sig-row">
      <div class="sig-box">Analyst<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
      <div class="sig-box">QC Supervisor<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
      <div class="sig-box">QA Officer (Authorisation)<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
    </div>
  `);return new s.NextResponse(g,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="CoA-${b.batch_no}.html"`}})}async function p(t){let e=await (0,i.mk)();if((0,i.TI)(e))return e;let{batchId:a}=await t.json(),o=(0,_.e)(),[c,l]=await Promise.all([o.from("batches").select("*").eq("id",a).single(),o.from("release_records").select("*").eq("batch_id",a).order("created_at",{ascending:!1}).limit(1).single()]),p=c.data,b=l.data;if(!p)return s.NextResponse.json({error:"Batch not found"},{status:404});let u=b?.release_type==="unconditional",h=n(`Release Certificate — ${p.batch_no}`,`
    <div class="hdr">
      <div><div class="co">${r}</div><div class="sub">${d}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: BATCH RELEASE CERTIFICATE</div>
        <div>Batch No.: <strong>${p.batch_no}</strong></div>
        <div>Release Ref.: ${b?.release_no??"PENDING"}</div>
      </div>
    </div>
    <div class="doc-title">${u?"UNCONDITIONAL":"CONDITIONAL"} BATCH RELEASE CERTIFICATE</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${p.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${p.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${p.batch_size??"—"} ${p.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${p.mfg_date??"—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${p.exp_date??"—"}</span></div>
      <div class="kv"><label>Release Date</label><span>${b?.release_date??"—"}</span></div>
      <div class="kv"><label>DRAP Reference</label><span>${b?.drap_ref??"—"}</span></div>
      <div class="kv"><label>Issued By</label><span>${b?.issued_by_name??"—"}</span></div>
    </div>
    <h3>Release Decision</h3>
    <div class="verdict-box ${u?"pass-box":""}" style="${u?"":"border-color:#c9991a;background:#fff9e8;color:#7a5500"}">
      ${b?`${u?"UNCONDITIONAL RELEASE":"CONDITIONAL RELEASE"}<br>
           <span style="font-weight:400;font-size:10px">This batch has been reviewed and found to comply with all applicable specifications${u?".":" subject to the stated conditions."}</span>`:'<span style="font-weight:400;font-style:italic">No release decision recorded. This is a draft document pending QA authorisation.</span>'}
    </div>
    ${b?.conditions?`<div style="padding:8px 12px;border:1px solid #bbb;margin-bottom:10px;font-size:10px"><strong>Conditions of Release:</strong><br>${b.conditions}</div>`:""}
    <div style="padding:8px 12px;border:1px solid #bbb;background:#f9f9f9;font-size:10px;margin-bottom:10px">
      This certificate is generated in accordance with DRAP/GMP requirements. The batch has been manufactured, tested and reviewed as per approved procedures and current specifications.
    </div>
    <div class="sig-row">
      <div class="sig-box">Person Responsible for Release (QA)<br><br>Name: ${b?.issued_by_name??"___________________"}<br>Signature: ___________________<br>Date: ${b?.release_date??"___________________"}</div>
      <div class="sig-box">Plant Manager / Director<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
    </div>
  `);return new s.NextResponse(h,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="ReleaseCert-${p.batch_no}.html"`}})}},5655:(t,e,a)=>{a.d(e,{e:()=>_,m:()=>i});class s{constructor(t,e=[]){this.selectFields="*",this.orderAsc=!0,this.data=[],this.table=t,this.data=e}select(t){return this.selectFields=t||"*",this}order(t,e){return this.orderField=t,this.orderAsc=e?.ascending??!0,this}eq(t,e){return this.data=this.data.filter(a=>a[t]===e),this}single(){return this}async then(t){return this.orderField&&this.data.sort((t,e)=>{let a=t[this.orderField],s=e[this.orderField];return this.orderAsc?a>s?1:-1:a<s?1:-1}),t({data:this.data,error:null})}}function _(){return{from:t=>{let e={batches:[{id:"1",batch_no:"BTH-001",product_name:"Paracetamol 500mg",created_at:new Date().toISOString(),release_status:"pending",prod_status:"pending"},{id:"2",batch_no:"BTH-002",product_name:"Ibuprofen 400mg",created_at:new Date().toISOString(),release_status:"released",prod_status:"released"}],users:[{id:"demo-user",name:"Demo User",email:"demo@example.com",role:"admin",is_active:!0}],stability_studies:[{id:"1",batch_id:"1",created_at:new Date().toISOString(),parameters:[],results:[],batch:{batch_no:"BTH-001",product_name:"Paracetamol 500mg"}}]}[t]||[];return new s(t,JSON.parse(JSON.stringify(e)))},auth:{getUser:async()=>({data:{user:{id:"demo-user"}},error:null})}}}function i(){return _()}}};