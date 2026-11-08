import {ownedDocumentPath} from './learning-state';
type StorageClient={auth:{getUser:()=>Promise<{data:{user:{id:string}|null};error:unknown}>};storage:{from:(bucket:string)=>{remove:(paths:string[])=>Promise<{data:{name:string}[]|null;error:{message:string}|null}>}}};
/** Only called after the user confirms the named file in the UI. */
export async function removeOwnedDocument(client:StorageClient,path:string){
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user)throw Error('Sign in to the owner account before deleting this file.');
 if(!ownedDocumentPath(path,user.id))throw Error('This file belongs to a different account. Nothing was deleted.');
 const result=await client.storage.from('learning-documents').remove([path]);
 if(result.error)throw Error(result.error.message);
 // A silent RLS no-op is not a successful deletion.
 if(!result.data?.some(file=>file.name===path))throw Error('Storage did not confirm removal. Check the owner DELETE policy (migration 004), then retry. Your library entry has been kept.');
}
