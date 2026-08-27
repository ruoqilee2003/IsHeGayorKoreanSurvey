/* ============ 題目內容 ============ */
const CLIPS = [
  "度假實境節目中，A 走進房間，以「자기야」（親愛的）稱呼 B，問了他一個問題。B 躺在沙發上滑手機，沒有抬頭，直接回答了。",
  "旅行實境節目中，D 還在睡，C 走過去在他臉頰上親了一下把他叫醒。D 睜開眼，翻了個身，繼續躺著。",
  "直播聊天時，E 提到自己前幾天又和 F 的父母一起吃了飯。他說這幾年常常這樣，有時候 F 不在，他也會自己去。",
];

const FACTORS = [
  {kpop:"反差", other:"反差",
    dKpop:"身高、年齡、性格或氣質等面向所呈現之落差感", dOther:"身高、年齡、性格或氣質等面向所呈現之落差感"},
  {kpop:"關係位置", other:"關係位置",
    dKpop:"형／동생（前後輩）之年齡序位、擔當分工，以及隊長與隊員間的位階差異", dOther:"年齡或資歷高低、能力分工，以及職位或立場上的不對等關係"},
  {kpop:"未解決的張力", other:"未解決的張力",
    dKpop:"情感未經明確表態，或歷經疏離後又重新靠近之曖昧歷程", dOther:"情感未經明確表態，或歷經疏離後又重新靠近之曖昧歷程"},
  {kpop:"團隊情誼", other:"共同經歷",
    dKpop:"長期共同活動所積累之情誼厚度與歷史脈絡", dOther:"長期共同經歷所積累之關係厚度與歷史脈絡"},
  {kpop:"視覺配對感", other:"視覺配對感",
    dKpop:"外型或畫面組合具視覺協調性，同時入鏡即具說服力", dOther:"外型或畫面組合具視覺協調性，同時入鏡即具說服力"},
  {kpop:"官方推力", other:"官方推力",
    dKpop:"隸屬同一分隊（unit）、同住、固定搭檔安排或官方企劃之推動", dOther:"原作或官方持續將兩人並置呈現，賦予固定搭檔或專屬篇章"},
  {kpop:"可否認性", other:"可否認性",
    dKpop:"毋須被明確定義為特定關係，保留多元詮釋之空間", dOther:"毋須被明確定義為特定關係，保留多元詮釋之空間"},
  {kpop:"社群誘因", other:"社群誘因",
    dKpop:"衍生創作與周邊產出豐富、社群討論熱絡，具備長期追溯與考證之條件", dOther:"衍生創作與周邊產出豐富、社群討論熱絡，具備長期追溯與考證之條件"}
];

const D = { version:null, is_carat:false, skipped:false, q2b:[], fields:[], factors:[] };   // 作答資料
let step = 0;

/* ============ 小工具 ============ */
const $  = s => document.querySelector(s);
const el = (h) => { const d=document.createElement("div"); d.innerHTML=h.trim(); return d.firstElementChild; };
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function radio(key, label, hint, opts, required=true){
  const h = `<div class="q">
    <label class="q-label">${esc(label)}${required?' <span class="req">*</span>':''}</label>
    ${hint?`<p class="q-hint">${esc(hint)}</p>`:""}
    <div class="opts" data-key="${key}">
      ${opts.map((o,i)=>`<label class="opt${D[key]===o?" on":""}">
        <input type="radio" name="${key}" value="${esc(o)}"${D[key]===o?" checked":""}>
        <span>${esc(o)}</span></label>`).join("")}
    </div></div>`;
  const node = el(h);
  node.querySelectorAll("input").forEach(inp=>{
    inp.addEventListener("change",()=>{
      D[key]=inp.value;
      node.querySelectorAll(".opt").forEach(o=>o.classList.remove("on"));
      inp.closest(".opt").classList.add("on");
    });
  });
  return node;
}

function textarea(key,label,hint,required=false){
  const node = el(`<div class="q">
    <label class="q-label">${esc(label)}${required?' <span class="req">*</span>':''}</label>
    ${hint?`<p class="q-hint">${esc(hint)}</p>`:""}
    <textarea data-k="${key}">${esc(D[key]||"")}</textarea></div>`);
  node.querySelector("textarea").addEventListener("input",e=>D[key]=e.target.value);
  return node;
}

function scale(key, label, tone, onChange){
  const cur = D[key];
  const node = el(`<div class="q scale">
    <label class="q-label">${esc(label)} <span class="req">*</span></label>
    <div class="ticks ${tone}">${[1,2,3,4,5,6,7].map(n=>
      `<button type="button" class="tick${cur&&n<=cur?" on":""}" data-v="${n}">${n}</button>`).join("")}</div>
    <div class="ends"><span>${tone==="pink"?"完全不曖昧":"極不尋常"}</span><span>${tone==="pink"?"高度曖昧":"極為常見"}</span></div>
  </div>`);
  node.querySelectorAll(".tick").forEach(b=>b.addEventListener("click",()=>{
    const v=+b.dataset.v;
    D[key]=v;
    node.querySelectorAll(".tick").forEach(t=>t.classList.toggle("on",+t.dataset.v<=v));
    if(onChange) onChange();
  }));
  return node;
}

/* signature：孔版疊印 */
function paintPlate(i){
  const p=$("#lp"+i), b=$("#lb"+i), say=$("#osay"+i);
  if(!p) return;
  const a=D["amb"+i], d=D["day"+i];
  p.style.width = a? (a/7*100)+"%" : "0";
  b.style.width = d? (d/7*100)+"%" : "0";
  if(a&&d){
    const lo=Math.min(a,d);
    say.textContent = lo>=5 ? "兩項評分皆偏高——兼具高度曖昧性與日常性。"
      : (a>=5&&d<=3) ? "偏曖昧：曖昧程度高於日常程度。"
      : (d>=5&&a<=3) ? "偏日常：日常程度高於曖昧程度。"
      : "兩項評分皆偏低，反應程度不甚強烈。";
  } else say.textContent="";
}

/* 因子複選（點選順序即優先順序） */
function factorBlock(version){
  const list = FACTORS.map(f=> version==="KPOP" ? [f.kpop,f.dKpop] : [f.other,f.dOther]);
  const node = el(`<div class="q">
    <label class="q-label">此配對最吸引您的因素為何？<span class="req">*</span></label>
    <p class="q-hint">至多可選擇三項，選取順序即代表優先程度，再次點選可取消選取。</p>
    <div class="factors"></div>
    <div class="q" style="margin-top:18px">
      <label class="q-label">其他（若上述選項皆不足以描述）</label>
      <input type="text" data-k="fac_other" value="${esc(D.fac_other||"")}" placeholder="請以您自己的文字說明">
    </div>
  </div>`);
  const box = node.querySelector(".factors");
  function renderFactors(){
    box.innerHTML="";
    list.forEach(([n,desc])=>{
      const f = el(`<div class="fac" tabindex="0" role="button" aria-pressed="false"><div class="rank">·</div>
        <div><b>${esc(n)}</b><em>${esc(desc)}</em></div></div>`);
      const pick=()=>{
        const at=D.factors.indexOf(n);
        if(at>-1) D.factors.splice(at,1);
        else { if(D.factors.length>=3) return; D.factors.push(n); }
        renderFactors(); // 只重繪因子清單，不重繪整頁，避免頁面跳回頂端
      };
      f.addEventListener("click",pick);
      f.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick();}});
      const idx=D.factors.indexOf(n);
      if(idx>-1){ f.classList.add("on"); f.setAttribute("aria-pressed","true"); f.querySelector(".rank").textContent=idx+1; }
      else if(D.factors.length>=3) f.classList.add("dim");
      box.appendChild(f);
    });
  }
  renderFactors();
  node.querySelector('[data-k="fac_other"]').addEventListener("input",e=>D.fac_other=e.target.value);

  return node;
}

/* Q2b：追星範圍複選，僅在 Q2 前兩項時顯示，決定 is_carat */
function buildQ2b(){
  const opts = ["SEVENTEEN","其他"];
  const qualifies = ["是，已持續關注三年以上","是，但關注時間尚短"].includes(D.q2);
  const node = el(`<div class="q${qualifies?"":" hidden"}" id="q2bBlock">
    <label class="q-label">您目前主要關注的團體為何？</label>
    <p class="q-hint">可複選，若同時關注多個團體，請一併勾選並於下方說明。</p>
    <div class="opts" id="q2bOpts">
      ${opts.map(o=>`<label class="opt${(D.q2b||[]).includes(o)?" on":""}">
        <input type="checkbox" value="${esc(o)}"${(D.q2b||[]).includes(o)?" checked":""}><span>${esc(o)}</span></label>`).join("")}
    </div>
    <label class="q-label" style="margin-top:14px">其他（請說明）</label>
    <input type="text" data-k="q2b_other" value="${esc(D.q2b_other||"")}">
  </div>`);
  node.querySelectorAll("#q2bOpts input").forEach(inp=>inp.addEventListener("change",()=>{
    D.q2b = [...node.querySelectorAll("#q2bOpts input:checked")].map(x=>x.value);
    D.is_carat = D.q2b.includes("SEVENTEEN");
    inp.closest(".opt").classList.toggle("on",inp.checked);
  }));
  node.querySelector('[data-k="q2b_other"]').addEventListener("input",e=>D.q2b_other=e.target.value);
  return node;
}

/* ============ 頁面 ============ */
function pageInfo(s){
  s.appendChild(el(`<div class="cover" style="padding-bottom:0">
    <h1 class="title">Is he Gay or Korean<span class="q">?</span></h1>
  </div>`));
  s.appendChild(el(`<div class="rule"></div>`));
  head(s,"問卷調查說明");
  s.appendChild(el(`<div class="info-text">
    <p>親愛的受訪者您好：</p>
    <p>我是國立同人女大學男偶像學系一年級的學生，目前於第一屆同人女研討會中執行「<b>Is he Gay or Korean？淺析KPOP男性偶像團體的RPS吸引力因子與解讀實踐——以SEVENTEEN為例</b>」的調查計畫，目的欲探究影響同人女配對偏好的可能因子，並進一步分析KPOP男性偶像團體脈絡持有之特質。</p>
    <p>本研究採用問卷調查法，欲篩選<b>CARAT（SEVENTEEN粉絲名稱）之同人愛好者</b>與<b>非KPOP粉絲之同人愛好者</b>，並預計於民國115年8月28日進行問卷調查，預計訪談15人，網路問卷填寫時間約5分鐘。</p>
    <p>本研究採用的所有資料將僅作娛樂與學術分析之用，不作商業利益用途，且本問卷採匿名回覆，故您的個人資料絕對不會被識別，<b>作者亦不會作任何主觀評論您所喜好的配對，結果僅會以整體方式呈現，請您放心填答。</b></p>
    <p>若您對此研究有任何疑問，歡迎您與我們聯絡，我們將為您做詳細的說明。最後再次感謝您所提供寶貴的意見及對本研究的支持！</p>
  </div>`));
  s.appendChild(el(`<p class="sig"><br>國立同人女大學男偶像學系一年級學生　ㄚㄑ<br>敬上</p>`));
  nav(s,"繼續",null,true);
}

function pageConsent(s){
  head(s,"參與者權益及研究說明");
  s.appendChild(el(`<div class="info-text">
    <p>親愛的受訪者您好：</p>
    <p>非常感謝您參與本研究之問卷調查！以下將提供您本研究之相關資訊，希望能在研究進行前，讓您對此研究有充分的瞭解。</p>
    <p>本研究採問卷調查法，研究個人之特質、想法及行為，並以「網路問卷」的方式進行匿名調查，故本研究於隱私外洩的風險上無明顯之風險，請您放心填答。將來發表研究結果時，也將僅以整體結果呈現（例如統計圖表），將不會洩露任何與您身份有關之資料。</p>
    <p>若您對上述說明或此研究有任何疑問，歡迎您與我們聯絡，我們將為您做詳細的說明。最後再次感謝您所提供寶貴的意見及對本研究的支持！</p>
  </div>`));
  s.appendChild(radio("consent","在您已詳細瞭解上述研究方法、其可能的益處與風險，以及有關本研究計畫的疑問已獲得詳細說明與解釋後，您是否願意填答此調查問卷？","",
    ["願意","不願意"]));

  const n = el(`<div class="nav">
    <button class="btn-ghost" id="back">上一頁</button>
    <button class="btn pink" id="next">下一頁</button></div>`);
  const e = el('<p class="err"></p>');
  s.appendChild(n); s.appendChild(e);
  n.querySelector("#back").onclick=()=>{step--;render();};
  n.querySelector("#next").onclick=()=>{
    if(!D.consent){ e.textContent="請選擇是否願意填答。"; return; }
    e.textContent="";
    if(D.consent==="不願意"){ renderDecline(); return; }
    step++; render();
  };
}

function renderDecline(){
  $("#bar").classList.add("hidden");
  const s=$("#stage"); s.innerHTML="";
  s.appendChild(el(`<div class="done"><div class="mark">×</div>
    <h2>謝謝您</h2>
    <p>感謝您撥冗閱讀本說明。若日後改變心意，歡迎重新整理頁面後再次填答。</p></div>`));
  window.scrollTo({top:0,behavior:"instant"});
}

function pageAbout(s){
  head(s,"關於您","以下先透過幾道題項，瞭解您平時參與同人／追星社群之概況。");
  s.appendChild(radio("q1","您平常是否會關注、投入特定人物間的配對詮釋（即所謂「CP」文化）？","",
    ["是，此為我主要的興趣","偶爾涉獵，但參與程度不深","甚少涉及","完全不涉及"]));

  const q2Node = radio("q2","您目前是否持續關注 KPOP 男性偶像團體？","",
    ["是，已持續關注三年以上","是，但關注時間尚短","曾經關注，目前已無","從未關注"]);
  s.appendChild(q2Node);

  const q2bNode = buildQ2b();
  s.appendChild(q2bNode);

  q2Node.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",()=>{
    const qualifies = ["是，已持續關注三年以上","是，但關注時間尚短"].includes(D.q2);
    D.version = qualifies ? "KPOP" : "OTHER";
    q2bNode.classList.toggle("hidden", !qualifies);
    if(!qualifies){ D.q2b=[]; D.q2b_other=""; D.is_carat=false; }
  }));

  s.appendChild(radio("q3","您對於韓國影視作品、綜藝節目或韓語之接觸程度為何？","",
    ["具備韓語能力，或長期接觸相關內容","有一定接觸，大致熟悉","幾乎未曾接觸"]));

  nav(s,"下一頁",()=> ["q1","q2","q3"].every(k=>D[k]) || "尚有題項未完成作答。");
}

function pageCP(s){
  const KPOP = D.version==="KPOP";
  head(s,"您所關注的配對", KPOP?"以下將詢問您目前主要關注的配對（CP）。":"以下將詢問您目前主要關注的配對（CP），範疇不限特定領域。");

  if(!KPOP){
    const fieldsQNode = el(`<div class="q"><label class="q-label">您主要關注的配對來自哪些領域？<span class="req">*</span></label>
      <p class="q-hint">可複選。</p><div class="opts" id="fields">
      ${["日本作品（動畫、遊戲、聲優）","歐美影視作品","華語文化圈","文學或舞台劇作","其他"].map(o=>
        `<label class="opt${(D.fields||[]).includes(o)?" on":""}"><input type="checkbox" value="${esc(o)}"${(D.fields||[]).includes(o)?" checked":""}><span>${esc(o)}</span></label>`).join("")}
      </div>
      <input type="text" id="fieldsOther" style="margin-top:10px" class="${(D.fields||[]).includes("其他")?"":"hidden"}" value="${esc(D.fields_other||"")}" placeholder="請說明其他領域">
      </div>`);
    s.appendChild(fieldsQNode);
    const fieldsOtherInput = fieldsQNode.querySelector("#fieldsOther");
    fieldsQNode.querySelectorAll("#fields input").forEach(inp=>inp.addEventListener("change",()=>{
      D.fields = [...fieldsQNode.querySelectorAll("#fields input:checked")].map(x=>x.value);
      inp.closest(".opt").classList.toggle("on",inp.checked);
      fieldsOtherInput.classList.toggle("hidden", !D.fields.includes("其他"));
    }));
    fieldsOtherInput.addEventListener("input",e=>D.fields_other=e.target.value);
  }

  const cpHint = D.is_carat
    ? "可填寫多組配對；若您為 CARAT，請至少填寫一組隸屬 SEVENTEEN 團體內部之配對，以利本研究針對 SEVENTEEN 個案進行團體內部配對之深入分析。"
    : "可填寫多組配對。";
  s.appendChild(el(`<div class="q"><label class="q-label">您目前最主要關注的配對為何？<span class="req">*</span></label>
    <p class="q-hint">${esc(cpHint)}</p>
    <input type="text" data-k="cp" value="${esc(D.cp||"")}" placeholder="例如：羅密歐x茱麗葉"></div>`));
  s.querySelector('[data-k="cp"]').addEventListener("input",e=>D.cp=e.target.value);

  s.appendChild(factorBlock(KPOP?"KPOP":"OTHER"));

  const crossQLabel = KPOP?"您在其他領域曾關注的配對，與此配對是否具有共通特質？":"您曾關注的數組配對之間，是否存在共通特質？";
  const crossYnNode = radio("cross_yn", crossQLabel, "", ["是","否"], false);
  s.appendChild(crossYnNode);
  const crossReasonNode = textarea("cross","若是，請說明其共通特質為何？","選填。");
  crossReasonNode.classList.toggle("hidden", D.cross_yn!=="是");
  s.appendChild(crossReasonNode);
  crossYnNode.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",()=>{
    crossReasonNode.classList.toggle("hidden", D.cross_yn!=="是");
  }));

  s.appendChild(textarea("reject","是否存在您明知廣受關注、卻自身難以認同或投入的配對？原因為何？（選答）"));

  const foot = el(`<p class="q-hint" style="margin-top:24px">
    目前呈現的是 <b>${KPOP?"KPOP 版本":"其他領域版本"}</b>之題目。
    <button class="linky" id="swap">切換至${KPOP?"其他領域":"KPOP"}版本</button></p>`);
  s.appendChild(foot);
  foot.querySelector("#swap").onclick=()=>{D.version=KPOP?"OTHER":"KPOP";D.factors=[];render();};

  nav(s,"下一頁",()=>{
    if(!KPOP && (!D.fields||D.fields.length===0)) return "請至少選擇一個領域。";
    if(!(D.cp||"").trim()) return "請填寫您目前最主要關注的配對。";
    if(D.factors.length===0) return "請至少選擇一項最吸引您的因素。";
    return true;
  });
}

function pageMeta(s){
  head(s,"關於互動之真實性與安排性","以下為本部分最後兩題。");
  s.appendChild(radio("real","對您而言，一段互動若「看似未經刻意安排」——例如鏡頭外片段、不經意的畫面——是否會影響其吸引力？","",
    ["影響甚鉅，愈不似安排愈具價值","具有影響，但非決定性因素","影響不大，無論是否安排皆能引發興趣","反而偏好明顯經過設計的橋段"]));
  s.appendChild(radio("acc","當您察覺當事人似乎意識到粉絲之詮釋，並可能配合演出時，您的感受較接近下列何者？","",
    ["好感度提升，產生一種共同參與之默契感","略感失望，認為此舉近似商品化操作","並無明顯影響，本即認知如此","視實際情況而定，若未流於過度仍可接受","未曾思考過此一問題"]));
  s.appendChild(textarea("why","承上題，請說明您的理由。（選答）"));
  nav(s,"下一頁",()=> (D.real&&D.acc) ? true : "尚有題項未完成作答。");
}

function pageClip(s){
  head(s,"場景敘述","以下為三段男性偶像團體成員間互動之描述，請依直覺作答。");
  const cnNum = ["一","二","三"];
  CLIPS.forEach((body,i)=>{
    s.appendChild(el(`<div class="clip"><div class="clip-t">情境${cnNum[i]}</div><p>${esc(body)}</p></div>`));
    s.appendChild(scale("amb"+i,"此互動呈現出的曖昧程度為何？","pink",()=>paintPlate(i)));
    s.appendChild(scale("day"+i,"此互動之「日常性」程度為何？於一般同性友人間的常見程度如何？","blue",()=>paintPlate(i)));
    s.appendChild(el(`<div class="over"><div class="over-t">兩層墨的疊印</div>
      <div class="plate"><div class="layer p" id="lp${i}"></div><div class="layer b" id="lb${i}"></div></div>
      <div class="over-say" id="osay${i}"></div></div>`));
    paintPlate(i);
    s.appendChild(textarea("open"+i,"您觀察到的內容為何？","請以您自己的文字描述，字數不限。",true));
  });
  s.appendChild(textarea("define","倘若官方未來明確定義兩人之關係（無論定義為何）您的感受將會如何？","本題為選答，但盼能聽取您較詳盡之說明。"));
  nav(s,"送出",()=>{
    for(let i=0;i<CLIPS.length;i++){
      if(!D["amb"+i]||!D["day"+i]) return "每個情境的兩項評分都要選。";
      if(!(D["open"+i]||"").trim()) return "請簡要描述您在每個情境觀察到的內容。";
    }
    return true;
  }, false, true);
}

function pageDone(s,saved){
  $("#bar").classList.add("hidden");
  const node = el(`<div class="done"><div class="mark">${saved?"✓":"×"}</div>
    <h2>${saved?"收到了":"送出失敗"}</h2>
    <p>${saved
      ? "您的回覆已成功送出，誠摯感謝您的參與。如有其他補充意見，歡迎與我們聯繫。"
      : "很抱歉，送出時發生問題，您的回覆尚未送達。請確認網路連線後重新送出；若持續失敗，麻煩與研究者聯繫，我們會協助您完成填答。"}</p>
    ${saved?"":`<div class="nav" style="border-top:none;padding-top:0;margin-top:24px">
      <button class="btn pink" id="retry">重新送出</button></div>`}
    </div>`);
  s.appendChild(node);
  if(!saved){
    node.querySelector("#retry").onclick=async()=>{
      const btn=node.querySelector("#retry");
      btn.disabled=true; btn.textContent="送出中…";
      await submitAll();
    };
  }
}

/* ============ 框架 ============ */
function head(s,title,note){
  s.appendChild(el(`<div style="padding-top:30px">
    <h2 class="sec">${esc(title)}</h2>${note?`<p class="sec-note">${esc(note)}</p>`:'<div style="height:20px"></div>'}</div>`));
}

function nav(s,label,validate,cover=false,submit=false){
  const n=el(`<div class="nav">
    ${step>0&&!cover?'<button class="btn-ghost" id="back">上一頁</button>':""}
    <button class="btn ${submit?"pink":""}" id="next">${esc(label)}</button></div>`);
  const e=el('<p class="err"></p>');
  s.appendChild(n); s.appendChild(e);
  const b=n.querySelector("#back"); if(b) b.onclick=()=>{step--;render();};
  n.querySelector("#next").onclick=async()=>{
    if(validate){ const r=validate(); if(r!==true){ e.textContent=r; return; } }
    e.textContent="";
    if(submit){ n.querySelector("#next").disabled=true; n.querySelector("#next").textContent="送出中…"; await submitAll(); return; }
    step++; render();
  };
}

const FRONT = 2; // pageInfo, pageConsent：不計入題目進度

function getPages(){
  return [pageInfo,pageConsent,pageAbout,pageCP,pageMeta,pageClip];
}

function render(){
  const pages=getPages();
  const s=$("#stage"); s.innerHTML="";
  if(step>=pages.length) return;
  $("#bar").classList.toggle("hidden",step<FRONT);
  const denom=pages.length-1-FRONT, num=Math.max(0,step-FRONT);
  $("#fill").style.width=(denom>0?(num/denom*100):0)+"%";
  $("#stepn").textContent=num+" / "+denom;
  pages[step](s);
  window.scrollTo({top:0,behavior:"instant"});
}

/* ============ 儲存 ============ */
async function submitAll(){
  const payload={...D, submitted_at:new Date().toISOString()};
  let ok=false;
  try{
    const res=await fetch("/api/responses",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    ok=res.ok;
  }catch(err){ console.error(err); ok=false; }
  const pages=getPages(); step=pages.length; const s=$("#stage"); s.innerHTML="";
  pageDone(s,ok);
  window.scrollTo({top:0,behavior:"instant"});
}

render();
