const rows = document.querySelector('#student-rows');
const searchInput = document.querySelector('#search');
const modal = document.querySelector('#modal');
const form = document.querySelector('#student-form');
const formError = document.querySelector('#form-error');
const emptyState = document.querySelector('#empty-state');
const noResults = document.querySelector('#no-results');
let students = [];
let editingId = null;
let searchTimer;

const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const palette = ['lavender', 'peach', 'mint', 'blue', 'rose', 'gold'];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = await response.json();
      message = body.detail || body.message || body.title || message;
      if (body.errors) message = Object.values(body.errors).join('. ');
    } catch { /* Keep the fallback message for empty responses. */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function addCell(row, text, className = '') {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = text;
  row.append(cell);
  return cell;
}

function renderStudents() {
  rows.replaceChildren();
  students.forEach((student, index) => {
    const row = document.createElement('tr');
    const identity = document.createElement('td');
    identity.className = 'student-cell';
    const avatar = document.createElement('span');
    avatar.className = `avatar student-avatar ${palette[index % palette.length]}`;
    avatar.textContent = initials(student.name);
    const name = document.createElement('span');
    name.className = 'student-name';
    name.textContent = student.name;
    identity.append(avatar, name);
    row.append(identity);
    addCell(row, student.email, 'email-cell');
    addCell(row, student.phoneNumber, 'phone-cell');
    const courseCell = document.createElement('td');
    const course = document.createElement('span');
    course.className = 'course-pill';
    course.textContent = student.course;
    courseCell.append(course);
    row.append(courseCell);
    addCell(row, `Year ${student.yearOfStudy}`, 'year-cell');
    const actions = document.createElement('td');
    actions.className = 'actions-cell';
    const edit = document.createElement('button');
    edit.className = 'row-action'; edit.textContent = 'Edit'; edit.setAttribute('aria-label', `Edit ${student.name}`);
    edit.addEventListener('click', () => openModal(student));
    const remove = document.createElement('button');
    remove.className = 'row-action delete-action'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${student.name}`);
    remove.addEventListener('click', () => deleteStudent(student));
    actions.append(edit, remove); row.append(actions); rows.append(row);
  });

  const count = students.length;
  document.querySelector('#result-count').textContent = count;
  document.querySelector('#nav-count').textContent = count;
  const searching = searchInput.value.trim().length > 0;
  emptyState.hidden = count > 0 || searching;
  noResults.hidden = count > 0 || !searching;
  document.querySelector('#table-summary').textContent = searching
    ? `Showing ${count} matching ${count === 1 ? 'student' : 'students'}`
    : `${count} ${count === 1 ? 'student' : 'students'} in your directory`;
}

function updateStats(allStudents) {
  document.querySelector('#total-stat').textContent = allStudents.length.toLocaleString();
  document.querySelector('#course-stat').textContent = new Set(allStudents.map((student) => student.course.toLowerCase())).size.toLocaleString();
  document.querySelector('#year-stat').textContent = new Set(allStudents.map((student) => student.yearOfStudy)).size.toLocaleString();
}

async function loadStudents(query = '') {
  try {
    const [visible, all] = await Promise.all([
      request(`/api/students${query ? `?search=${encodeURIComponent(query)}` : ''}`),
      query ? request('/api/students') : Promise.resolve(null),
    ]);
    students = visible;
    renderStudents();
    updateStats(all || visible);
  } catch (error) {
    document.querySelector('#table-summary').textContent = error.message;
    document.querySelector('#total-stat').textContent = '—';
    document.querySelector('#course-stat').textContent = '—';
    document.querySelector('#year-stat').textContent = '—';
  }
}

function openModal(student = null) {
  editingId = student?.id ?? null;
  form.reset();
  formError.hidden = true;
  formError.textContent = '';
  document.querySelector('#modal-title').textContent = editingId ? 'Edit student' : 'Add a student';
  document.querySelector('.modal-heading p').textContent = editingId ? 'Update the details for this student.' : 'Fill in the details below to create a record.';
  document.querySelector('#save-student').innerHTML = editingId ? 'Save changes <span>→</span>' : 'Save student <span>→</span>';
  if (student) Object.entries(student).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
  modal.hidden = false;
  document.body.classList.add('modal-open');
  form.elements.name.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  editingId = null;
}

async function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name} from the directory? This cannot be undone.`)) return;
  try {
    await request(`/api/students/${student.id}`, { method: 'DELETE' });
    await loadStudents(searchInput.value.trim());
  } catch (error) {
    window.alert(error.message);
  }
}

document.querySelector('#add-student').addEventListener('click', () => openModal());
document.querySelector('#empty-add').addEventListener('click', () => openModal());
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); }
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});
searchInput.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => loadStudents(searchInput.value.trim()), 180);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.yearOfStudy = Number(payload.yearOfStudy);
  const button = document.querySelector('#save-student');
  button.disabled = true;
  try {
    await request(editingId ? `/api/students/${editingId}` : '/api/students', {
      method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload),
    });
    closeModal();
    await loadStudents(searchInput.value.trim());
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
  } finally {
    button.disabled = false;
  }
});

loadStudents();
