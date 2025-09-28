import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        cookies().delete('token')
        cookies().delete('userRole')
        return NextResponse.json({ message: "successfully logout" }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}