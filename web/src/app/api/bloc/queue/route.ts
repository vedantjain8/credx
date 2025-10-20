import { NextRequest, NextResponse } from "next/server";

type QueueItemType = {
  website_id: string;
  article_url: string;
  budget: number;
};

const queue = [] as Array<QueueItemType>;

export async function POST(request: NextRequest) {
  // add item to queue
  const { website_id, article_url, budget } = await request.json();
  if (!website_id || !article_url || !budget) {
    return new NextResponse(JSON.stringify({ message: "Missing parameters" }), {
      status: 400,
    });
  }

  queue.push({ website_id, article_url, budget });
  return NextResponse.json({ message: "Item added to queue" }, { status: 200 });
}

export async function GET(request: NextRequest) {
  // get the first item in queue
  if (queue.length === 0) {
    return new NextResponse(JSON.stringify({ message: "Queue is empty" }), {
      status: 200,
    });
  }

  return NextResponse.json({ message: queue[0] }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  // remove item from queue
  if (queue.length === 0) {
    return new NextResponse(JSON.stringify({ message: "Queue is empty" }), {
      status: 200,
    });
  }

  queue.shift();
  return NextResponse.json(
    { message: "Item removed from queue" },
    { status: 200 }
  );
}
