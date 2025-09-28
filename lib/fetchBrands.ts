import axios from "axios";

export const fetchBrands = async ({
  search,
  skip,
  limit,
  token,
  notIn,
  fields,
  lang = "ar",
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
  notIn?: number[];
  fields?: string;
  lang?: "en" | "ar";
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: lang === "ar" ? "nameAr" : "name",
      lang
    });
    if (fields) {
      queryParams.append("fields", fields);
    }
    if (notIn) {
      queryParams.append("id[notIn]", JSON.stringify(notIn));
    }

    const { data } = await axios.get(`/api/brands?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: data.brands,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { data: [], totalPages: 0 };
  }
};
