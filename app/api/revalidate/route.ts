import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();

    // You may want to add some authentication here
    // to ensure only authenticated requests can revalidate
    if (!tag) {
      return NextResponse.json(
        { message: "Missing tag parameter" },
        { status: 400 }
      );
    }

    // Revalidate the cached data with this tag
    revalidateTag(tag);

    return NextResponse.json(
      { revalidated: true, message: `Tag ${tag} revalidated` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: err },
      { status: 500 }
    );
  }
}
