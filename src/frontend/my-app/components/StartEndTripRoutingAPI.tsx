export const getStartEndTrip = async (start: { latitude: number, longitude: number } | null, end: { latitude: number, longitude: number } | null, seed: number, p: number, radius: number) => {
  if (start == null || end == null) {
    console.log("something went wrong with start/end coordinates");
    return;
  }
  const res = await fetch(
    "http://192.168.0.15:8443/startEndTrip",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { latitude: start.latitude, longitude: start.longitude },
        stop: { latitude: end.latitude, longitude: end.longitude }
      }),
    }
  );

  if (!res.ok) {
    // optional: custom handling
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}







