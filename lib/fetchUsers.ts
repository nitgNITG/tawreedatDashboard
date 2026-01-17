import axios from "axios";
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  image_url?: string;
  Wallet?: {
    buyerAmount: number;
    point: number;
  };
}

interface FetchUsersParams {
  token: string;
  search?: string;
  skip?: string | number;
  limit?: string | number;
  role?: string;
  notIn?: string[];
  fields?: string;
}

export const fetchUsers = async (params: FetchUsersParams) => {
  const { token, ...searchParams } = params;

  const queryParams = new URLSearchParams({
    fields: searchParams.fields ?? "id,full_name,email,phone",
    limit: searchParams.limit?.toString() ?? "10",
    sort: "full_name",
  });
  if (searchParams.notIn)
    queryParams.append("id[notIn]", JSON.stringify(searchParams.notIn));
  if (searchParams.skip) {
    queryParams.append("skip", searchParams.skip.toString());
  }
  if (searchParams.search) {
    queryParams.append("keyword", searchParams.search.toString());
  }

  try {
    const { data } = await axios.get(`/api/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: data.users,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
