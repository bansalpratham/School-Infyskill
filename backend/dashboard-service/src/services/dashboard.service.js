const { createHttpClient } = require('../config/http');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function getServiceUrls() {
  const student = process.env.STUDENT_SERVICE_URL;
  const teacher = process.env.TEACHER_SERVICE_URL;
  const fees = process.env.FEES_SERVICE_URL;
  const payments = process.env.PAYMENTS_SERVICE_URL;

  if (!student || !teacher || !fees || !payments) {
    throw httpError(500, 'Downstream service URLs are not configured');
  }

  return { student, teacher, fees, payments };
}

async function safeGet(client, path) {
  try {
    const res = await client.get(path);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data };
    }
    return {
      ok: false,
      error: {
        status: res.status,
        message: res.data?.message || 'Downstream request failed'
      }
    };
  } catch (e) {
    return {
      ok: false,
      error: {
        status: 0,
        message: e.message || 'Downstream request error'
      }
    };
  }
}

async function getOverview() {
  const timeoutMs = Number(process.env.SERVICE_TIMEOUT_MS) || 2500;
  const urls = getServiceUrls();

  const studentClient = createHttpClient({ baseURL: urls.student, timeoutMs });
  const teacherClient = createHttpClient({ baseURL: urls.teacher, timeoutMs });
  const feesClient = createHttpClient({ baseURL: urls.fees, timeoutMs });
  const paymentsClient = createHttpClient({ baseURL: urls.payments, timeoutMs });

  const [studentsRes, teachersRes, feesSummaryRes, paymentsRes] = await Promise.all([
    safeGet(studentClient, '/api/students?limit=1&page=1'),
    safeGet(teacherClient, '/api/teachers?limit=1&page=1'),
    safeGet(feesClient, '/api/fees/summary'),
    safeGet(paymentsClient, '/api/payments?limit=1&page=1')
  ]);

  const errors = {};

  const overview = {
    students: null,
    teachers: null,
    fees: null,
    payments: null
  };

  if (studentsRes.ok) {
    overview.students = {
      total: studentsRes.data?.meta?.total ?? null
    };
  } else {
    errors.studentService = studentsRes.error;
  }

  if (teachersRes.ok) {
    overview.teachers = {
      total: teachersRes.data?.meta?.total ?? null
    };
  } else {
    errors.teacherService = teachersRes.error;
  }

  if (feesSummaryRes.ok) {
    overview.fees = feesSummaryRes.data?.data ?? feesSummaryRes.data;
  } else {
    errors.feesService = feesSummaryRes.error;
  }

  if (paymentsRes.ok) {
    overview.payments = {
      total: paymentsRes.data?.meta?.total ?? null
    };
  } else {
    errors.paymentsService = paymentsRes.error;
  }

  return {
    overview,
    errors: Object.keys(errors).length ? errors : null
  };
}

module.exports = {
  getOverview
};
