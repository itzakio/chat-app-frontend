import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // ১. ইউজারের টোকেন চেক করো (কুকি থেকে)
    const token = request.cookies.get('token')?.value;
    
    // ২. ইউজার কোন পেইজ খুলতে চাচ্ছে
    const { pathname } = request.nextUrl;
    
    // ৩. কোন পেইজগুলো পাবলিক (লগইন ছাড়া দেখা যাবে)
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // ৪. লগইন পেইজগুলো (যেখানে লগইন করা ইউজার যাবে না)
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.includes(pathname);
    
    // ৫. মেইন লজিক: যদি টোকেন না থাকে আর পাবলিক রাউট না হয়
    if (!token && !isPublicRoute) {
        // লগইন পেইজে পাঠিয়ে দাও
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname); // কোন পেইজ চেয়েছিল সেটাও পাঠাও
        return NextResponse.redirect(loginUrl);
    }
    
    // ৬. যদি টোকেন থাকে আর লগইন/রেজিস্টার পেইজে যেতে চায়
    if (token && isAuthRoute) {
        // চ্যাট পেইজে পাঠিয়ে দাও
        return NextResponse.redirect(new URL('/chat', request.url));
    }
    
    // ৭. বাকি সব ক্ষেত্রে স্বাভাবিকভাবে যেতে দাও
    return NextResponse.next();
}

// ৮. কোন পাথে মিডলওয়্যার চলবে সেটা বলে দাও
export const config = {
    matcher: [
        /*
         * সব পাথে চলবে কিন্তু এইগুলা ছাড়া:
         * - _next/static (স্ট্যাটিক ফাইল)
         * - _next/image (ইমেজ অপটিমাইজেশন)
         * - favicon.ico (ফেভিকন)
         * - public ফোল্ডার
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};