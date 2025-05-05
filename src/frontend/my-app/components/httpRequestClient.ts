
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
const CURRENTIP = '172.20.10.8'
export async function sendRouteDataHttpRequest<T>(
  routeData: T,
  userID: number
): Promise<BackendResponse<T> | null> {
  try {
    const response = await fetch(
      `http://${CURRENTIP}:8443/routesAdd`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userID": userID.toString(),
        },
        body: JSON.stringify(routeData),
      }
    );

    if (!response.ok) {
      const errBody =
        (await response.json().catch(() => ({}))) ?? {};
      throw new Error(
        errBody.error ||
        `HTTP ${response.status} ${response.statusText}`
      );
    }

    const json = (await response.json()) as BackendResponse<T>;

    if (!json.success) {
      console.warn("API responded with error:", json.error);
      return json;
    }

    console.log("✅ Route added, got back:", json.data);
    return json;
  } catch (err: any) {
    console.error("❌ sendRouteDataHttpRequest failed:", err);
    return null;
  }
}



export async function getRouteApi(apiType: number): Promise<BackendResponse<Response>> {
  switch (apiType) {
    case 1:
      break;

    case 2:
      break;

    case 3:
      break;
    default:
      return { success: false, error: "Not a valid request type." }
  }
  return { success: false, error: "internal function error please report to Dan" }

}
