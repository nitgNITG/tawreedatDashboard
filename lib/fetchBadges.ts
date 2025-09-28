import axios from "axios";

const fetchBadges = async ({
  search,
  skip,
  limit,
  token,
  lang = "en",
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
  lang: "en" | "ar";
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: "name",
      lang,
    }).toString();

    const { data } = await axios.get(`/api/badges?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: data.badges,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { data: [], totalPages: 0 };
  }
};
export default fetchBadges;
