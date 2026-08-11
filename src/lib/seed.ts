import dbConnect from "./dbConnect";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import Subject from "@/models/Subject";
import Faculty from "@/models/Faculty";
import SiteSettings from "@/models/SiteSettings";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  if ((global as any).isSeedingDone) {
    return;
  }
  (global as any).isSeedingDone = true;

  try {
    await dbConnect();

    // Ensure specific Super Admin exists
    const superAdminEmail = "khan@dua.com";
    // Clean up legacy admin account if present
    await User.deleteOne({ email: "admin@duaacademy.pk" });

    const superAdminExists = await User.findOne({ email: superAdminEmail });
    const salt = await bcrypt.genSalt(12);
    const superAdminPassword = await bcrypt.hash("RKhanC07", salt);
    if (!superAdminExists) {
      await User.create({
        name: "Sarkar Khan",
        email: superAdminEmail,
        password: superAdminPassword,
        role: "admin",
        isApproved: true,
        isActive: true,
      });
      console.log(`🌱 Seeded Super Admin: ${superAdminEmail}`);
    } else {
      superAdminExists.password = superAdminPassword;
      superAdminExists.loginAttempts = 0;
      superAdminExists.lockUntil = undefined;
      await superAdminExists.save();
      console.log(`🌱 Updated Super Admin password to RKhanC07 and reset lockout state`);
    }

    // 1. Check if seeding is already done
    const classCount = await Class.countDocuments();
    if (classCount > 0) {
      return; // Already seeded
    }

    console.log("🌱 Database is empty. Seeding initial data...");

    // 2. Seed Streams
    const streamsData = [
      { name: "Pre-Medical", description: "F.Sc. Pre-Medical stream" },
      { name: "Pre-Engineering", description: "F.Sc. Pre-Engineering stream" },
      { name: "General Science", description: "Science group with computer science" },
      { name: "Commerce", description: "Commerce & General Arts group" },
    ];
    const streams = await Stream.insertMany(streamsData);
    const streamMap = streams.reduce((acc: any, stream: any) => {
      acc[stream.name] = stream._id;
      return acc;
    }, {});

    // 3. Seed Classes
    const classesData = [
      { name: "11th Class", streamRef: streamMap["Pre-Medical"] },
      { name: "12th Class", streamRef: streamMap["Pre-Medical"] },
      { name: "MDCAT", streamRef: streamMap["Pre-Medical"] },
      { name: "ECAT", streamRef: streamMap["Pre-Engineering"] },
    ];
    const classes = await Class.insertMany(classesData);
    const classMap = classes.reduce((acc: any, cls: any) => {
      acc[cls.name] = cls._id;
      return acc;
    }, {});

    // 4. Seed Subjects
    const subjectsData = [
      // 11th Class
      { name: "Physics", classRef: classMap["11th Class"] },
      { name: "Chemistry", classRef: classMap["11th Class"] },
      { name: "Biology", classRef: classMap["11th Class"] },
      { name: "English", classRef: classMap["11th Class"] },

      // 12th Class
      { name: "Physics", classRef: classMap["12th Class"] },
      { name: "Chemistry", classRef: classMap["12th Class"] },
      { name: "Biology", classRef: classMap["12th Class"] },
      { name: "English", classRef: classMap["12th Class"] },

      // MDCAT
      { name: "Biology", classRef: classMap["MDCAT"] },
      { name: "Chemistry", classRef: classMap["MDCAT"] },
      { name: "Physics", classRef: classMap["MDCAT"] },
      { name: "English", classRef: classMap["MDCAT"] },
      { name: "Logical Reasoning", classRef: classMap["MDCAT"] },

      // ECAT
      { name: "Mathematics", classRef: classMap["ECAT"] },
      { name: "Physics", classRef: classMap["ECAT"] },
      { name: "Chemistry", classRef: classMap["ECAT"] },
      { name: "English", classRef: classMap["ECAT"] },
    ];
    await Subject.insertMany(subjectsData);

    // 5. Seed Faculty (Dynamic collections)
    const facultyData = [
      {
        name: "Sir M. Safar Kalhoro",
        subject: "Physics",
        qualification: "M.Sc. Physics",
        experience: "15+ Years",
        imageUrl: "/brand/safar_physics.jpg",
        order: 1,
      },
      {
        name: "Sir Ali Murad Kehar",
        subject: "Physics",
        qualification: "M.Sc. Physics",
        experience: "12+ Years",
        imageUrl: "/brand/ali_physics.jpg",
        order: 2,
      },
      {
        name: "Sir Rajesh Jhalani (M.Phil.)",
        subject: "Chemistry",
        qualification: "M.Phil. Chemistry",
        experience: "18+ Years",
        imageUrl: "/brand/rajesh_chemistry.jpg",
        order: 3,
      },
      {
        name: "Sir Ayaz Hussain Khuharo",
        subject: "Biology",
        qualification: "M.Sc. Zoology / Biology Specialist",
        experience: "14+ Years",
        imageUrl: "/brand/ayaz_biology.jpg",
        order: 4,
      },
      {
        name: "Sir Asghar Ali Chachar",
        subject: "Mathematics",
        qualification: "M.Sc. Mathematics",
        experience: "16+ Years",
        imageUrl: "/brand/asghar_maths.jpg",
        order: 5,
      },
      {
        name: "Sir Bhajan Dass Sheraka",
        subject: "English",
        qualification: "M.A. English Literature",
        experience: "20+ Years",
        imageUrl: "/brand/bhajan_english.jpg",
        order: 6,
      },
    ];
    await Faculty.insertMany(facultyData);

    // 6. Seed SiteSettings (Singleton)
    const settingsData = {
      commenceDate: "September 1, 2026",
      classTimings: "03:00 PM - 07:00 PM",
      admissionsOpen: true,
      whatsappNumber: "0333-5524440",
      address: "Ikhlas Model High School, Mirpur Mathelo",
    };
    await SiteSettings.create(settingsData);

    console.log("🌱 Database seeded successfully!");
  } catch (error) {
    (global as any).isSeedingDone = false;
    console.error("Database seeding failed:", error);
    throw error;
  }
}
