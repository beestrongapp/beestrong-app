function pushSupported(){
  return !!('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);
}

function pushConfigured(){
  return !!(typeof PUSH_VAPID_PUBLIC_KEY!=='undefined'&&PUSH_VAPID_PUBLIC_KEY&&PUSH_VAPID_PUBLIC_KEY.length>20);
}

function pushStatusLabel(){
  if(!pushSupported())return tt({pl:'Ten telefon/browser nie wspiera push',en:'Push not supported on this device/browser',de:'Push wird nicht unterstützt',es:'Push no compatible'});
  if(!pushConfigured())return tt({pl:'Wymaga konfiguracji VAPID',en:'VAPID setup required',de:'VAPID-Konfiguration nötig',es:'Requiere configurar VAPID'});
  if(Notification.permission==='granted')return tt({pl:'Włączone',en:'Enabled',de:'Aktiviert',es:'Activadas'});
  if(Notification.permission==='denied')return tt({pl:'Zablokowane w ustawieniach telefonu',en:'Blocked in device settings',de:'In Geräteeinstellungen blockiert',es:'Bloqueadas en ajustes'});
  return tt({pl:'Wyłączone',en:'Off',de:'Aus',es:'Desactivadas'});
}

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const rawData=atob(base64);
  const outputArray=new Uint8Array(rawData.length);
  for(let i=0;i<rawData.length;i++)outputArray[i]=rawData.charCodeAt(i);
  return outputArray;
}

async function getPushRegistration(){
  const reg=await navigator.serviceWorker.ready;
  return reg;
}

async function enablePushNotifications(){
  if(!S.user)return showSyncToast(tt({pl:'Zaloguj się, aby włączyć powiadomienia.',en:'Sign in to enable notifications.',de:'Zum Aktivieren anmelden.',es:'Inicia sesión para activar notificaciones.'}),'error');
  if(!pushSupported())return showSyncToast(pushStatusLabel(),'error');
  if(!pushConfigured())return showSyncToast(tt({pl:'Brakuje klucza VAPID w konfiguracji appki.',en:'Missing VAPID key in app config.',de:'VAPID-Schlüssel fehlt.',es:'Falta la clave VAPID.'}),'error');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')return showSyncToast(pushStatusLabel(),'error');
  const reg=await getPushRegistration();
  let sub=await reg.pushManager.getSubscription();
  if(!sub){
    sub=await reg.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlBase64ToUint8Array(PUSH_VAPID_PUBLIC_KEY),
    });
  }
  await savePushSubscription(sub);
  showSyncToast(tt({pl:'Powiadomienia włączone.',en:'Notifications enabled.',de:'Benachrichtigungen aktiviert.',es:'Notificaciones activadas.'}),'success');
  if(typeof renderSettings==='function')renderSettings();
}

async function disablePushNotifications(){
  if(!pushSupported())return;
  const reg=await getPushRegistration();
  const sub=await reg.pushManager.getSubscription();
  if(sub){
    if(sb&&S.user)await sb.from('push_subscriptions').delete().eq('endpoint',sub.endpoint).eq('user_id',S.user.id);
    await sub.unsubscribe();
  }
  showSyncToast(tt({pl:'Powiadomienia wyłączone.',en:'Notifications disabled.',de:'Benachrichtigungen deaktiviert.',es:'Notificaciones desactivadas.'}),'success');
  if(typeof renderSettings==='function')renderSettings();
}

async function togglePushNotifications(){
  if(!pushSupported())return showSyncToast(pushStatusLabel(),'error');
  if(Notification?.permission==='granted'){
    const sub=await (await getPushRegistration()).pushManager.getSubscription();
    if(sub)return disablePushNotifications();
  }
  return enablePushNotifications();
}

async function savePushSubscription(subscription){
  if(!sb||!S.user||!subscription)return;
  const json=subscription.toJSON();
  const ua=(navigator.userAgent||'').slice(0,240);
  const{error}=await sb.from('push_subscriptions').upsert({
    user_id:S.user.id,
    endpoint:json.endpoint,
    p256dh:json.keys?.p256dh,
    auth:json.keys?.auth,
    user_agent:ua,
    updated_at:new Date().toISOString(),
  },{onConflict:'endpoint'});
  if(error)throw error;
}

async function refreshPushSubscription(){
  if(!pushSupported()||!pushConfigured()||!S.user||Notification.permission!=='granted')return;
  try{
    const sub=await (await getPushRegistration()).pushManager.getSubscription();
    if(sub)await savePushSubscription(sub);
  }catch(e){console.warn('refreshPushSubscription',e);}
}

async function sendPushToUser(userId,payload){
  if(!userId||!payload||!sb||!S.user)return;
  try{
    const{data}=await sb.auth.getSession();
    const token=data?.session?.access_token;
    if(!token)return;
    await fetch(`${SUPABASE_URL}/functions/v1/send-push`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body:JSON.stringify({userId,payload}),
    });
  }catch(e){console.warn('sendPushToUser',e);}
}

window.pushSupported=pushSupported;
window.pushConfigured=pushConfigured;
window.pushStatusLabel=pushStatusLabel;
window.togglePushNotifications=togglePushNotifications;
window.refreshPushSubscription=refreshPushSubscription;
window.sendPushToUser=sendPushToUser;
