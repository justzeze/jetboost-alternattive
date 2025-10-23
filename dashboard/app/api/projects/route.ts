import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-supabase';

export async function GET() {
  try {
    const projects = await db.getAllProjects();
    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        domain: p.domain,
        apiKey: p.apiKey,
        createdAt: p.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get projects' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const project = await db.createProject({
      name,
      domain,
      apiKey: `jb_${crypto.randomUUID().replace(/-/g, '')}`
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        apiKey: project.apiKey,
        createdAt: project.createdAt
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 400 }
    );
  }
}
