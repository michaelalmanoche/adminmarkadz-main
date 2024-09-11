import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(req: NextRequest) {
  const { firstname, middlename, lastname, license_no, contact, region, city, brgy, street } = await req.json();

  try {
    // Check if the license number already exists
    const [existingOperator] = await pool.query('SELECT * FROM operators WHERE license_no = ?', [license_no]);

    if ((existingOperator as any[]).length > 0) {
      return NextResponse.json({ message: 'License number already registered' }, { status: 409 });
    }

    const [result] = await pool.query(
      'INSERT INTO operators (firstname, middlename, lastname, license_no, contact, region, city, brgy, street) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstname, middlename, lastname, license_no, contact, region, city, brgy, street]
    );

    // Type assertion to ResultSetHeader to access insertId
    const insertResult = result as mysql.ResultSetHeader;

    return NextResponse.json({ id: insertResult.insertId, firstname, middlename, lastname, license_no, contact, region, city, brgy, street }, { status: 201 });
  } catch (error: any) { // Explicitly typing error as 'any'
    return NextResponse.json({ message: 'Failed to add operator', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const [rows] = await pool.query('SELECT * FROM operators WHERE archived = 0');
    return NextResponse.json(rows);
  } catch (error: any) { // Explicitly typing error as 'any'
    return NextResponse.json({ message: 'Failed to retrieve operators', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Attempt to parse the request body
    const requestBody = await req.json();
    const id = requestBody?.id;

    console.log('Received request to archive operator with ID:', id);

    if (!id) {
      return NextResponse.json({ message: 'Operator ID is required' }, { status: 400 });
    }

    const [result] = await pool.query('UPDATE operators SET archived = 1 WHERE id = ?', [id]);
    console.log('Update result:', result);

    if ((result as mysql.ResultSetHeader).affectedRows > 0) {
      return NextResponse.json({ message: 'Operator archived successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Operator not found or already archived' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error archiving operator:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Failed to archive operator', error: error.message }, { status: 500 });
  }
}