import { NextRequest, NextResponse } from 'next/server';

interface UploadResponse {
  success: boolean;
  fileName: string;
  fileType: 'image' | 'pdf' | null;
  fileSize: number;
  message: string;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const ALLOWED_PDF_TYPE = 'application/pdf';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          fileName: '',
          fileType: null,
          fileSize: 0,
          message: 'No file provided',
          error: 'No file in request',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          fileName: file.name,
          fileType: null,
          fileSize: file.size,
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          error: 'File size exceeded',
        },
        { status: 400 }
      );
    }

    // Determine file type
    let fileType: 'image' | 'pdf' | null = null;
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      fileType = 'image';
    } else if (file.type === ALLOWED_PDF_TYPE) {
      fileType = 'pdf';
    }

    if (!fileType) {
      return NextResponse.json(
        {
          success: false,
          fileName: file.name,
          fileType: null,
          fileSize: file.size,
          message: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}, ${ALLOWED_PDF_TYPE}`,
          error: 'Invalid file type',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      message: 'File validated successfully',
    });
  } catch (error) {
    console.error('[Upload Error]', error);
    return NextResponse.json(
      {
        success: false,
        fileName: '',
        fileType: null,
        fileSize: 0,
        message: 'Upload validation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
