import axios from "axios";

export const fetchRoles = async ({
  search,
  skip,
  limit,
  token,
}: {
  search: string;
  skip: number;
  limit: number;
  token: string;
}) => {
  try {
    const queryParams = new URLSearchParams({
      keyword: search,
      limit: String(limit),
      skip: String(skip),
      sort: "name",
    }).toString();

    const { data } = await axios.get(`/api/roles?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: data.roles,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { data: [], totalPages: 0 };
  }
};
