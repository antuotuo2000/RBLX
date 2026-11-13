(function(){
'use strict';
if(window.__researchLogin||location.hostname!=='antuotuo2000.github.io')return;
window.__researchLogin=true;
var CLIENT='913804147137-cmftqur4o34bn5a4o7ae3rn3r3jhieqn.apps.googleusercontent.com';
var nonce=Array.from(crypto.getRandomValues(new Uint8Array(24)),function(x){return x.toString(16).padStart(2,'0')}).join('');
var host=document.querySelector('header');if(!host)return;
var box=document.createElement('div');box.id='research-login';
var button=document.createElement('div'),status=document.createElement('span'),account=document.createElement('div'),name=document.createElement('span'),logout=document.createElement('button');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.className='login-status';status.textContent='正在加载登录…';
account.hidden=true;logout.type='button';logout.textContent='退出';logout.className='login-out';name.className='login-name';
var avatar=document.createElement('button'),photo=document.createElement('img'),initial=document.createElement('span'),menu=document.createElement('div');
avatar.type='button';avatar.className='login-avatar';avatar.setAttribute('aria-label','打开账号菜单');avatar.setAttribute('aria-expanded','false');avatar.setAttribute('aria-controls','research-account-menu');
photo.alt='';photo.referrerPolicy='no-referrer';photo.hidden=true;avatar.append(photo,initial);
menu.id='research-account-menu';menu.className='login-menu';menu.hidden=true;menu.append(name,logout);
account.className='login-account';account.append(avatar,menu);box.append(button,account,status);host.append(box);
function closeMenu(){menu.hidden=true;avatar.setAttribute('aria-expanded','false')}
avatar.onclick=function(){menu.hidden=!menu.hidden;avatar.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)logout.focus()};
document.addEventListener('click',function(e){if(!account.contains(e.target))closeMenu()});
account.addEventListener('keydown',function(e){if(e.key==='Escape'){closeMenu();avatar.focus()}});
account.addEventListener('focusout',function(e){if(!account.contains(e.relatedTarget))closeMenu()});
photo.onerror=function(){photo.hidden=true;initial.hidden=false};
var style=document.createElement('style');style.textContent='#research-login{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto;max-width:100%}#research-login [hidden]{display:none!important}.login-status{font-size:11px;color:#aab59c;max-width:260px;line-height:1.6}.login-name{font-size:13px;color:#d7e5c6;max-width:160px;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:middle;white-space:nowrap}.login-out{font-size:12px;margin-left:12px;padding:7px 10px;background:transparent;color:#d7dfcd;border:1px solid #515c45;border-radius:4px;cursor:pointer}@media(max-width:700px){#research-login{margin-left:0;width:100%}}@media print{#research-login{display:none}}';style.textContent+='#research-login .login-account{position:relative}#research-login .login-avatar{width:38px;height:38px;border-radius:50%;padding:0;border:1px solid #657452;background:#283321;color:#e1edd4;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer}#research-login .login-avatar img{width:100%;height:100%;object-fit:cover}#research-login .login-avatar:focus-visible{outline:2px solid #d3e3ba;outline-offset:4px}#research-login .login-menu{position:absolute;right:0;top:calc(100% + 12px);min-width:170px;padding:14px;background:#20271b;border:1px solid #4c5940;border-radius:9px;box-shadow:0 12px 35px #0006;z-index:100}#research-login .login-name{display:block;margin-bottom:10px}#research-login .login-out{margin:0;width:100%;text-align:left;padding:9px 12px}#research-login .login-status:empty{display:none}';document.head.append(style);
function decode(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),function(c){return c.charCodeAt(0)})}
async function verify(token){
var parts=token.split('.');if(parts.length!==3)throw Error('token');
var h=JSON.parse(new TextDecoder().decode(decode(parts[0]))),p=JSON.parse(new TextDecoder().decode(decode(parts[1])));
var now=Math.floor(Date.now()/1000);
if(h.alg!=='RS256'||p.aud!==CLIENT||!['https://accounts.google.com','accounts.google.com'].includes(p.iss)||p.exp<=now||p.iat>now+60||p.nonce!==nonce||!p.sub)throw Error('claims');
var response=await fetch('https://www.googleapis.com/oauth2/v3/certs',{credentials:'omit',cache:'no-cache'});if(!response.ok)throw Error('certs');
var keys=(await response.json()).keys,key=keys.find(function(k){return k.kid===h.kid});if(!key)throw Error('key');
var imported=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',imported,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('signature');
return p;
}
var expiresTimer,generation=0;
function signedOut(){generation++;clearTimeout(expiresTimer);account.hidden=true;button.hidden=false;name.textContent='';closeMenu();photo.removeAttribute('src');photo.hidden=true;initial.textContent='';status.textContent='';}
logout.onclick=function(){window.google.accounts.id.disableAutoSelect();signedOut()};
var loader=document.createElement('script');loader.src='https://accounts.google.com/gsi/client?hl=zh_CN';loader.async=true;
loader.onload=function(){
window.google.accounts.id.initialize({client_id:CLIENT,nonce:nonce,auto_select:false,ux_mode:'popup',callback:async function(r){
var attempt=++generation;status.textContent='正在验证账号…';
try{var p=await verify(r.credential);if(attempt!==generation)return;name.textContent=p.name||'Google用户';initial.textContent=Array.from(p.name||'G')[0];initial.hidden=false;photo.hidden=true;
if(p.picture){try{var imageURL=new URL(p.picture);if(imageURL.protocol==='https:'&&(imageURL.hostname==='googleusercontent.com'||imageURL.hostname.endsWith('.googleusercontent.com'))){photo.onload=function(){photo.hidden=false;initial.hidden=true};photo.src=imageURL.href}}catch(e){}}
avatar.setAttribute('aria-label',(p.name||'Google用户')+'，打开账号菜单');closeMenu();button.hidden=true;account.hidden=false;status.textContent='';expiresTimer=setTimeout(signedOut,Math.min((p.exp*1000-Date.now()),2147483647));}
catch(e){if(attempt===generation)status.textContent='验证失败，请重试；报告仍可直接阅读。'}
}});
window.google.accounts.id.renderButton(button,{type:'standard',theme:'outline',size:'medium',text:'signin_with',shape:'pill',locale:'zh_CN'});status.textContent='';
};
loader.onerror=function(){status.textContent='Google登录暂不可用，报告仍可直接阅读。'};
document.head.append(loader);
})();