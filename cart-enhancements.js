
(function(){
const CART_KEY='atelier_cart_v1';
const toast=document.createElement('div');toast.id='toast';toast.className='toast';document.body.appendChild(toast);
function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
document.addEventListener('click',e=>{
 if(e.target && e.target.id==='checkoutBtn'){window.location.href='pagamento.html'}
 if(e.target && e.target.id==='clearCartBtn'){localStorage.removeItem(CART_KEY);location.reload()}
});
function ensureWA(){
 const modal=document.getElementById('productModal');
 if(!modal) return;
 let btn=document.getElementById('waInfoBtn');
 if(!btn){
   btn=document.createElement('a');
   btn.id='waInfoBtn';
   btn.className='btn btn--ghost';
   btn.target='_blank';
   btn.textContent='Perguntar no WhatsApp';
   const meta=document.getElementById('modalMeta')||modal;
   meta.appendChild(btn);
 }
 const title=(document.getElementById('modalTitle')||{}).textContent||'';
 if(title){
   const num=((window.CONTACT&&window.CONTACT.whatsappNumber)||'').replace(/\D/g,'');
   const msg=encodeURIComponent(`Olá, gostaria de saber mais sobre a obra "${title}".`);
   btn.href=`https://wa.me/${num}?text=${msg}`;
 }
}
const obs=new MutationObserver(ensureWA);
obs.observe(document.body,{subtree:true,childList:true});
setInterval(ensureWA,800);
})();
