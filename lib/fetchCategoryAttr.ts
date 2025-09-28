import axios from "axios";

export type Colors = {
  id: number;
  name: string;
  code: string;
};

export type Countries = {
  id: number;
  name: string;
  code: string;
  phoneCode: string;
};

export const fetchColors = async ({
  search,
  skip,
  limit,
  token,
  lang = "ar",
  notIn,
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
  lang: "en" | "ar";
  notIn?: string[];
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: "name",
    });
    if (notIn) queryParams.append("name[notIn]", JSON.stringify(notIn));

    const { data } = await axios.get(
      `/api/categories/colors?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );
    console.log("Fetched categories:", data);

    return {
      data: data.colors,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { data: [], totalPages: 0 };
  }
};

export const fetchCountries = async ({
  search,
  skip,
  limit,
  token,
  lang = "ar",
  notIn,
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
  lang: "en" | "ar";
  notIn?: string[];
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: "name",
    });
    if (notIn) queryParams.append("name[notIn]", JSON.stringify(notIn));
    const { data } = await axios.get(
      `/api/categories/countries?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );
    console.log("Fetched countries:", data);

    return {
      data: data.countries,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching countries:", error);
    return { data: [], totalPages: 0 };
  }
};
