import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import path from "path";

interface OCRRequest {
  fileType: "image" | "pdf";
  fileName: string;
  fileBuffer: string; // base64 encoded
  pageNumbers?: number[];
}

interface PageResult {
  page: number;
  text: string;
  confidence: number;
}

interface OCRResponse {
  success: boolean;
  fileName: string;
  fileType: string;
  pages: PageResult[];
  totalPages: number;
  extractedText: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<OCRResponse>> {
  let worker: Tesseract.Worker | null = null;

  // Safe defaults for response error objects
  let reqFileName = "unknown";
  let reqFileType = "image";

  try {
    const body: OCRRequest = await request.json();
    reqFileName = body.fileName || reqFileName;
    reqFileType = body.fileType || reqFileType;

    const { fileType, fileName, fileBuffer } = body;

    if (!fileType || !fileName || !fileBuffer) {
      return NextResponse.json(
        {
          success: false,
          fileName: reqFileName,
          fileType: reqFileType,
          pages: [],
          totalPages: 0,
          extractedText: "",
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const imageData = Buffer.from(fileBuffer, "base64");
    let results: PageResult[] = [];

    // Resolve the worker script using Node's module resolution so the
    // packaged tesseract.js modules stay linked together. Avoid pointing
    // into `public/` copies because the worker expects relative requires
    // (e.g. `require('..')`) that break when the file is moved.
    // Note: Vercel Serverless functions may restrict worker_threads; if
    // you run into runtime errors consider running OCR on the client or
    // using an external OCR API.
    let nodeWorkerPath: string | undefined;
    try {
      // Prefer require.resolve to get the installed package path
      // (keeps relative requires working).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      nodeWorkerPath = require.resolve('tesseract.js/src/worker/node/index.js');
    } catch (e) {
      // Fallback: try to construct path from node_modules
      nodeWorkerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker', 'node', 'index.js');
    }

    // Initialize worker with Node.js-compatible configuration
    worker = await createWorker('eng', 1, {
      workerPath: nodeWorkerPath,
      logger: (log) => {
        // suppressed by default
      },
    });

    // 2. Run recognition
    if (fileType === "image" || fileType === "pdf") {
      // Note: Tesseract.js cannot natively parse multi-page PDFs directly via buffers.
      // It handles single images or single-page PDF raw graphics data.
      const result = await worker.recognize(imageData);
      // console.log(`[OCR Result] Page 1: ${result.data.text.substring(0, 100)}...`);

      results.push({
        page: 1,
        text: result.data.text,
        confidence: result.data.confidence,
      });
    }

    // 3. Clean up the worker manually
    await worker.terminate();

    const extractedText = results
      // .map((r) => `--- Page ${r.page} ---\n${r.text}`)
      // .map((r) => `${r.page > 0 ? `\n` : ""}${r.text}`)
      .map((r) => r.text)
      .join("\n\n");

    return NextResponse.json({
      success: true,
      fileName,
      fileType,
      pages: results,
      totalPages: 1,
      extractedText,
    });
  } catch (error) {
    console.error("[OCR Error]", error);

    // Always attempt to terminate worker on failure to prevent memory leaks
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
    }

    return NextResponse.json(
      {
        success: false,
        fileName: reqFileName,
        fileType: reqFileType,
        pages: [],
        totalPages: 0,
        extractedText: "",
        error: error instanceof Error ? error.message : "OCR processing failed",
      },
      { status: 500 },
    );
  }
}
