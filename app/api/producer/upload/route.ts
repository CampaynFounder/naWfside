import { NextResponse } from 'next/server';
import { supabaseClient } from '../../../../lib/supabase/client';

export async function POST(request: Request) {
  // placeholder: return presigned URL instructions
  return NextResponse.json({ message: 'Upload endpoint placeholder - implement presigned URL logic' }, { status: 501 });
}

