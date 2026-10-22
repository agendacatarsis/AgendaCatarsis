/* Catarsis · agregar una hora a cualquier calendario (iPhone, Samsung, Huawei, Xiaomi, Google, Outlook…)
   Lo usan reserva.html (la clienta), panelcatarsis.html (tú) y calendario.html.
   Evento: {titulo, fecha:'AAAA-MM-DD', hora:minutos desde 00:00, dur:minutos, lugar, detalle, uid, avisos:true|false}
   Las horas se interpretan en hora de Chile (America/Santiago), aunque el teléfono esté en otra zona. */
(function(){
  var Z='America/Santiago';
  function q(n){return String(n).padStart(2,'0')}
  function enc(s){return encodeURIComponent(String(s==null?'':s))}
  function partes(f){return String(f).split('-').map(Number)}
  // hora de pared (sin zona), para Google: AAAAMMDDTHHMMSS
  function local(f,min){var p=partes(f),x=new Date(Date.UTC(p[0],p[1]-1,p[2],0,min));
    return x.getUTCFullYear()+q(x.getUTCMonth()+1)+q(x.getUTCDate())+'T'+q(x.getUTCHours())+q(x.getUTCMinutes())+'00'}
  // instante real (milisegundos UTC) de una hora de Chile
  function utc(f,min){var p=partes(f),g=Date.UTC(p[0],p[1]-1,p[2],0,min);
    try{var fm=new Intl.DateTimeFormat('en-US',{timeZone:Z,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),o={};
      fm.formatToParts(new Date(g)).forEach(function(t){o[t.type]=t.value});
      return g+(g-Date.UTC(+o.year,+o.month-1,+o.day,(+o.hour)%24,+o.minute))}
    catch(_){return new Date(p[0],p[1]-1,p[2],0,min).getTime()}}
  function z(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'')}
  function iso(ms){return new Date(ms).toISOString().replace(/\.\d+Z$/,'Z')}
  function fin(e){return e.hora+(+e.dur||60)}
  function google(e){return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+enc(e.titulo)+'&dates='+local(e.fecha,e.hora)+'/'+local(e.fecha,fin(e))+'&ctz='+Z+'&details='+enc(e.detalle)+'&location='+enc(e.lugar)}
  function outlook(e){return 'https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject='+enc(e.titulo)+'&startdt='+enc(iso(utc(e.fecha,e.hora)))+'&enddt='+enc(iso(utc(e.fecha,fin(e))))+'&location='+enc(e.lugar)+'&body='+enc(e.detalle)}
  function ics(e){
    function x(v){return String(v==null?'':v).replace(/[\\;,]/g,function(m){return '\\'+m}).replace(/\r?\n/g,'\\n')}
    var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Catarsis//Agenda//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
      'UID:'+x(e.uid||(e.fecha+'-'+e.hora+'-'+Date.now()))+'@agenda.catarsisosorno.cl','DTSTAMP:'+z(Date.now()),
      'DTSTART:'+z(utc(e.fecha,e.hora)),'DTEND:'+z(utc(e.fecha,fin(e))),'SUMMARY:'+x(e.titulo),'LOCATION:'+x(e.lugar),'DESCRIPTION:'+x(e.detalle)];
    if(e.avisos!==false)L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+x(e.titulo),'TRIGGER:-P1D','END:VALARM','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+x(e.titulo),'TRIGGER:-PT2H','END:VALARM');
    L.push('END:VEVENT','END:VCALENDAR');
    // líneas de máximo 75 caracteres (norma del formato de calendario)
    return L.map(function(l){var o='';while(l.length>74){o+=l.slice(0,74)+'\r\n ';l=l.slice(74)}return o+l}).join('\r\n')+'\r\n'}
  function esIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function esAndroid(){return /Android/i.test(navigator.userAgent)}
  function abrir(u){var w=null;try{w=window.open(u,'_blank','noopener')}catch(_){}if(!w)location.href=u}
  // Calendario del teléfono: archivo .ics que abre la app de calendario (iPhone: Calendario; Android: Samsung, Huawei, Xiaomi y otras)
  function telefono(e){var t=ics(e);
    if(esIOS()){location.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(t);return}
    var u=URL.createObjectURL(new Blob([t],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');
    a.href=u;a.download=(e.archivo||'hora-catarsis')+'.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},10000)}
  var CSS='.calcat-f{position:fixed;inset:0;z-index:99999;background:rgba(31,27,22,.45);display:flex;align-items:flex-end;justify-content:center;animation:calcatf .2s ease}'+
    '.calcat-s{width:100%;max-width:460px;background:#F7F1E6;color:#2a211a;border-radius:22px 22px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.25);font:15px/1.4 Inter,system-ui,sans-serif;animation:calcats .25s ease}'+
    '.calcat-s h4{margin:0 0 2px;font:600 18px Inter,system-ui,sans-serif}.calcat-s .calcat-sub{margin:0 0 14px;color:#6b5a45;font-size:13.5px}'+
    '.calcat-o{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:1px solid #d6c7aa;border-radius:14px;padding:13px 14px;margin:0 0 8px;cursor:pointer;color:inherit;font:inherit}'+
    '.calcat-o b{display:block;font-weight:600}.calcat-o small{display:block;color:#6b5a45;font-size:12.5px}.calcat-o i{font-style:normal;font-size:24px;width:30px;text-align:center}'+
    '.calcat-x{display:block;width:100%;background:none;border:0;padding:12px;margin-top:2px;color:#6b5a45;font:600 15px Inter,system-ui,sans-serif;cursor:pointer}'+
    '@keyframes calcatf{from{opacity:0}}@keyframes calcats{from{transform:translateY(40px);opacity:.4}}'+
    '@media(prefers-color-scheme:dark){.calcat-s{background:#282420;color:#f1e7d3}.calcat-o{background:#1d1a16;border-color:#443c30}.calcat-s .calcat-sub,.calcat-o small,.calcat-x{color:#c4b9a6}}';
  function opciones(){var ios=esIOS();
    return [{k:'tel',i:'📱',b:ios?'Calendario del iPhone':'Calendario del teléfono',s:ios?'Se abre tu Calendario para agregarla':'Samsung, Huawei, Xiaomi u otro: abre el archivo que se descarga'},
            {k:'g',i:'📅',b:'Google Calendar',s:'Tu cuenta de Google (se ve en cualquier teléfono)'},
            {k:'o',i:'🗓️',b:'Outlook / Hotmail',s:'Tu cuenta de Microsoft'}]}
  function ejecutar(k,e){if(k==='tel')telefono(e);else if(k==='g')abrir(google(e));else if(k==='o')abrir(outlook(e))}
  // Menú con todas las opciones
  function css(){if(!document.getElementById('calcat-css')){var st=document.createElement('style');st.id='calcat-css';st.textContent=CSS;document.head.appendChild(st)}}
  // Aviso simple dentro de la misma página
  function aviso(t,txt){css();var f=document.createElement('div');f.className='calcat-f';f.setAttribute('role','alertdialog');
    f.innerHTML='<div class="calcat-s"><h4></h4><p class="calcat-sub" style="font-size:14.5px;margin-bottom:6px"></p><button type="button" class="calcat-x">Entendido</button></div>';
    f.querySelector('h4').textContent=t;f.querySelector('.calcat-sub').textContent=txt;
    f.addEventListener('click',function(ev){if(ev.target===f||ev.target.closest('.calcat-x'))f.remove()});document.body.appendChild(f)}
  function menu(e){
    css();
    var f=document.createElement('div');f.className='calcat-f';f.setAttribute('role','dialog');f.setAttribute('aria-label','Agregar a mi calendario');
    f.innerHTML='<div class="calcat-s"><h4>Agregar a mi calendario</h4><p class="calcat-sub"></p>'+opciones().map(function(o){return '<button type="button" class="calcat-o" data-k="'+o.k+'"><i>'+o.i+'</i><span><b>'+o.b+'</b><small>'+o.s+'</small></span></button>'}).join('')+'<button type="button" class="calcat-x">Cancelar</button></div>';
    f.querySelector(".calcat-sub").textContent=e.resumen||e.titulo;
    function cerrar(){f.remove()}
    f.addEventListener('click',function(ev){var b=ev.target.closest('[data-k]');if(b){cerrar();ejecutar(b.dataset.k,e);return}if(ev.target===f||ev.target.closest('.calcat-x'))cerrar()});
    document.body.appendChild(f)}
  // Enlace a calendario.html con el evento (para abrirlo en Chrome desde la app del panel)
  function enlace(e,base){var p=new URLSearchParams();['titulo','fecha','hora','dur','lugar','detalle','uid','resumen'].forEach(function(k){if(e[k]!=null&&e[k]!=='')p.set(k,e[k])});if(e.avisos===false)p.set('avisos','0');
    return new URL('calendario.html',base||location.href).href+'#'+p.toString()}
  function desdeEnlace(h){var p=new URLSearchParams(String(h||location.hash).replace(/^#/,''));if(!p.get('fecha'))return null;
    return {titulo:p.get('titulo')||'Hora en Catarsis',fecha:p.get('fecha'),hora:+p.get('hora')||0,dur:+p.get('dur')||60,lugar:p.get('lugar')||'',detalle:p.get('detalle')||'',uid:p.get('uid')||'',resumen:p.get('resumen')||'',avisos:p.get('avisos')!=='0'}}
  window.CalCat={aviso:aviso,instante:function(e){return {ini:utc(e.fecha,e.hora),fin:utc(e.fecha,fin(e))}},google:google,outlook:outlook,ics:ics,telefono:telefono,menu:menu,opciones:opciones,ejecutar:ejecutar,enlace:enlace,desdeEnlace:desdeEnlace,esIOS:esIOS,esAndroid:esAndroid};
})();
