import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Extract the ID from the URL

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  const {
    mv_file_no,
    plate_number,
    engine_no,
    chassis_no,
    denomination,
    piston_displacement,
    number_of_cylinders,
    fuel,
    make,
    series,
    body_type,
    body_no,
    year_model,
    gross_weight,
    net_weight,
    shipping_weight,
    net_capacity,
    year_last_registered,
    expiration_date,
  } = await req.json();

  try {
    const [result] = await pool.query(
      `UPDATE vans SET
        mv_file_no = ?, plate_number = ?, engine_no = ?, chassis_no = ?, denomination = ?, piston_displacement = ?, number_of_cylinders = ?, fuel = ?, make = ?, series = ?, body_type = ?, body_no = ?, year_model = ?, gross_weight = ?, net_weight = ?, shipping_weight = ?, net_capacity = ?, year_last_registered = ?, expiration_date = ?
        WHERE id = ?`,
      [
        mv_file_no,
        plate_number,
        engine_no,
        chassis_no,
        denomination,
        piston_displacement,
        number_of_cylinders,
        fuel,
        make,
        series,
        body_type,
        body_no,
        year_model,
        gross_weight,
        net_weight,
        shipping_weight,
        net_capacity,
        year_last_registered,
        expiration_date,
        id,
      ]
    );

    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows > 0) {
      return NextResponse.json({ message: "Van updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Van not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update van", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Attempt to parse the request body
    const requestBody = await req.json();
    const id = requestBody?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Van ID is required" },
        { status: 400 }
      );
    }

    // Set the archived flag to 1
    const [result] = await pool.query(
      "UPDATE vans SET archived = 1 WHERE id = ?",
      [id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows > 0) {
      return NextResponse.json(
        { message: "Van archived successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Van not found or already archived" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to archive van", error: error.message },
      { status: 500 }
    );
  }
}
