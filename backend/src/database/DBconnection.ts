
import mongoose from "mongoose";

export const DBconnection = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "PERSONAL_FINANCE_MANAGEMENT",
    });

    console.log("Connected to Database");
  } catch (error) {
    console.error(`Database connection error: ${(error as Error).message}`);
    process.exit(1); 
  }
};


// import mongoose from "mongoose";

// export const DBconnection = async (): Promise<void> => {
//   try {
//     await mongoose.connect(
//       "mongodb+srv://shivangi:shivangi@cluster0.stp0q.mongodb.net/?retryWrites=true&w=majority",
//       {
//         dbName: "PERSONAL_FINANCE_MANAGEMENT",
//       }
//     );

//     console.log("Connected to Database");
//   } catch (error) {
//     console.error(`Database connection error: ${(error as Error).message}`);
//     process.exit(1);
//   }
// };
