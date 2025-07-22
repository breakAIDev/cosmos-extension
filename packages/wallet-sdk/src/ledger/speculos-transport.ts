let SpeculosHttpTransport: any;
let useSpeculosTransport = false;

export function setUseSpeculosTransport(use: boolean) {
  useSpeculosTransport = use;
}

export function getUseSpeculosTransport() {
  return useSpeculosTransport;
}

export function setSpeculosTransport(httpTransport: any) {
  SpeculosHttpTransport = httpTransport;
}

export async function getSpeculosTransport() {
  
  //@ts-ignore
  if (window.TRANSPORT_API_PORT !== undefined) {
    
    //@ts-ignore
    const speculosTransport = await SpeculosHttpTransport.open({ apiPort: window.TRANSPORT_API_PORT });
    return speculosTransport;
  }
}
