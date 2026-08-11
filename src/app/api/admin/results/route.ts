import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attempt from "@/models/Attempt";
import "@/models/User"; // Register User schema in context
import "@/models/Test"; // Register Test schema in context
import "@/models/Subject"; // Register Subject schema in context
import { secureRouteHandler } from "@/lib/security";

export async function GET(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const url = new URL(req.url);
    const classFilter = url.searchParams.get("classRef") || "";
    const subjectFilter = url.searchParams.get("subjectRef") || "";
    const testFilter = url.searchParams.get("testRef") || "";

    const query: any = {};

    // Filter by testRef directly if specified
    if (testFilter) {
      query.testRef = testFilter;
    }

    // Load attempts and populate nested student and test references
    const attempts = await Attempt.find(query)
      .populate({
        path: "studentRef",
        select: "name email studentDetails",
      })
      .populate({
        path: "testRef",
        populate: [
          { path: "classRef", select: "name" },
          { path: "subjectRef", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // Perform secondary filtering in memory if Class or Subject is filtered
    // because Mongo populate does not filter parent items natively
    let filteredAttempts = attempts;

    if (classFilter) {
      filteredAttempts = filteredAttempts.filter(
        (att: any) => att.testRef?.classRef?._id?.toString() === classFilter
      );
    }

    if (subjectFilter) {
      filteredAttempts = filteredAttempts.filter(
        (att: any) => att.testRef?.subjectRef?._id?.toString() === subjectFilter
      );
    }

    // Format the results for easy list rendering
    const formatted = filteredAttempts.map((att: any) => ({
      _id: att._id.toString(),
      studentName: att.studentRef?.name || "Unknown Student",
      studentEmail: att.studentRef?.email || "",
      studentPhone: att.studentRef?.studentDetails?.phone || "",
      testTitle: att.testRef?.title || "Deleted/Archived Test",
      className: att.testRef?.classRef?.name || "General",
      subjectName: att.testRef?.subjectRef?.name || "General",
      score: att.score || 0,
      totalQuestions: att.totalQuestions || 0,
      percentage: att.percentage || 0,
      tabSwitches: att.tabSwitches || 0,
      autoSubmitted: att.autoSubmitted || false,
      mode: att.mode || "practice",
      createdAt: att.createdAt,
    }));

    return NextResponse.json({ attempts: formatted });
  } catch (error: any) {
    console.error("Fetch Student Results Error:", error);
    return NextResponse.json({ error: "Internal Server Error fetching results" }, { status: 500 });
  }
}
