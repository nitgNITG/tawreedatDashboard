import axios from "axios";

const fetchCategories = async ({
  search,
  skip,
  limit,
  token,
  lang = "ar",
  notIn,
  parentName,
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
  lang: "en" | "ar";
  notIn?: number[];
  parentName?: string;
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: "name",
    });
    if (notIn) queryParams.append("id[notIn]", `[${notIn.join(",")}]`);
    console.log(`[${notIn?.join(",")}]`);
    
    if (parentName) queryParams.append("name", decodeURIComponent(parentName));

    const { data } = await axios.get(
      `/api/categories?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );
    console.log("Fetched categories:", data);

    return {
      data: data.categories,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { data: [], totalPages: 0 };
  }
};
export default fetchCategories;
