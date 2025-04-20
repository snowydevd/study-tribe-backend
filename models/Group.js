class Group {
  constructor(id, name, students = [], subject) {
    this.id = id;
    this.name = name;
    this.students = students;
    this.subject = subject;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }

  addStudent(student) {
    this.students.push(student);
    this.updatedAt = new Date();
  }

  removeStudent(studentId) {
    this.students = this.students.filter((student) => student.id !== studentId);
    this.updatedAt = new Date();
  }

  getStudents() {
    return this.students;
  }
}

module.exports = Group;
