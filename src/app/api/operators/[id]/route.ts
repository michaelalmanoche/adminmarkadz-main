import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extract the ID from the URL

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM operators WHERE id = ?', [id]);
    const operators = rows as Array<{ id: number; firstname: string; middlename: string; lastname: string; license_no: string; contact: string; region: string; city: string; brgy: string; street: string }>;

    if (operators.length > 0) {
      return NextResponse.json(operators[0]);
    } else {
      return NextResponse.json({ message: 'Operator not found' }, { status: 404 });
    }
  } catch (error: any) { // Explicitly typing error as 'any'
    return NextResponse.json({ message: 'Failed to retrieve operator', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extract the ID from the URL

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  const { firstname, middlename, lastname, license_no, contact, region, city, brgy, street } = await req.json();

  try {
    const [result] = await pool.query(
      'UPDATE operators SET firstname = ?, middlename = ?, lastname = ?, license_no = ?, contact = ?, region = ?, city = ?, brgy = ?, street = ? WHERE id = ?',
      [firstname, middlename, lastname, license_no, contact, region, city, brgy, street, id]
    );

    // Type assertion to ResultSetHeader to access affectedRows
    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows > 0) {
      return NextResponse.json({ message: 'Operator updated successfully' });
    } else {
      return NextResponse.json({ message: 'Operator not found or no changes made' }, { status: 404 });
    }
  } catch (error: any) { // Explicitly typing error as 'any'
    return NextResponse.json({ message: 'Failed to update operator', error: error.message }, { status: 500 });
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