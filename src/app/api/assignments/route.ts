import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(req: NextRequest) {
  const { van_id, operator_id } = await req.json();

  try {
    // Cast the result to RowDataPacket[]
    const [existingAssignment] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM assignments WHERE van_id = ? OR operator_id = ?',
      [van_id, operator_id]
    );

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { message: 'Van or operator is already assigned' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO assignments (van_id, operator_id) VALUES (?, ?)',
      [van_id, operator_id]
    );

    const insertResult = result as mysql.ResultSetHeader;

    return NextResponse.json({ id: insertResult.insertId, van_id, operator_id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to add assignment', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { id, van_id, operator_id } = await req.json();

  try {
    // Cast the result to RowDataPacket[]
    const [existingAssignment] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM assignments WHERE (van_id = ? OR operator_id = ?) AND id != ?',
      [van_id, operator_id, id]
    );

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { message: 'Van or operator is already assigned' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE assignments SET van_id = ?, operator_id = ? WHERE id = ?',
      [van_id, operator_id, id]
    );

    return NextResponse.json({ message: 'Assignment updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update assignment', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Cast the result to RowDataPacket[]
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM assignments');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to retrieve assignments', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    const [[result]] = await pool.query<mysql.ResultSetHeader[]>(
      'DELETE FROM assignments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete assignment', error: error.message }, { status: 500 });
  }
}