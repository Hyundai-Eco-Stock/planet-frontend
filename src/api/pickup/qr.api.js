import apiClient from "@/api/_base/apiClient";

export async function resolveQr(d) {
  const { data } = await apiClient.get("/qr/resolve", { params: { d } });
  return data; 
}