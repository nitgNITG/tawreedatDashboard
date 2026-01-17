"use server";
export const fetchData = async (api: string, config?: RequestInit) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${api}`,

      config
    );
    const body = await res.json();
    if (!res.ok) {
      console.log("error fetching data: ", body);

      return { data: null, error: body, loading: false };
    }
    const data = body;
    return { data, error: null, loading: false };
  } catch (error) {
    console.error(error);
    return { data: null, error, loading: false };
  }
};
