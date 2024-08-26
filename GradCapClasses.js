var studentList = [];
var counselorList = [];
var requirementList = []


class GraduationTracker {
    constructor(creditsRequirementTotal) {
        this.creditsRequirementTotal = creditsRequirementTotal;
        this.isApprovedByOverride = false;
        this.completedCourses = [];
        this.futureCourses = [];
    }
    getCreditsRequirementTotal() {
        return creditsRequirementTotal;
    }
    getIsApprovedByOverride() {
        return isApprovedByOverride;
    }
    getCompletedCourses() {
        return this.completedCourses;
    }
    getFutureCourses() {
        return this.futureCourses;
    }
    addCompletedCourse(courseRecord) {
        completedCourses = []''
        completedCourses.push(courseRecord);
        console.log("ADDING RECORD: " + completedCourses[0].getCourseCode());
    }
}

class Student {
    constructor(id, lastName, firstName, gradeLevel, counselorName) {
        this.id = id;
        this.lastName = lastName;
        this.firstName = firstName;
        this.gradeLevel = gradeLevel;
        this.counselorName = counselorName;
        this.transcript = new GraduationTracker(120);
    }
    getId() {
        return this.id;
    }
    getLastName() {
        return this.lastName;
    }
    getFirstName() {
        return this.firstName;
    }
    getCounselorName() {
        return this.counselorName;
    }
    addCompletedCourse(ccr) {
        this.transcript.addCompletedCourse(ccr);
    }
}

class Counselor {
    constructor(lastName, firstName) {
        this.lastName = lastName;
        this.firstName = firstName;
    }
    getLastName() {
        return this.lastName;
    }
    getFirstName() {
        return this.firstName;
    }
}

class GraduationRequirement {
    constructor(requirementName, code, requiredTotalPoints) {
        this.requirementName = requirementName;
        this.code = code;
        this.requiredTotalPoints = requiredTotalPoints;
        this.requiredTotalCredits = 0;
    }
    getRequirementName() {
        return this.requirementName;
    }
    getCode() {
        return this.code;
    }
    getRequiredTotalPoints() {
        return this.requiredTotalPoints;
    }
    getRequiredTotalCredits() {
        return this.requiredTotalCredits;
    }
}

class CourseRecord {
    constructor(studentName, courseCode, courseName,
            schoolYearCourseWasTaken, studentGradeLevelWhenTaken,
            credits, requirementCode, requirementPointValue) {
        this.studentName = studentName;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.schoolYearCourseWasTaken = schoolYearCourseWasTaken;
        this.studentGradeLevelWhenTaken = studentGradeLevelWhenTaken;
        this.numCredits = credits;
        this.requirementPointValue = requirementPointValue;
        // this.possibleRequirementCodes = requirementCode.split("\\s*;\\s*");
        this.possibleRequirementCodes = [];
        //Default to the initial code if there are multiple
        this.currentRequirementCode = requirementCode;
    }
    getStudentName() {
        return this.studentName;
    }
    getCourseCode() {
        return this.courseCode;
    }
    getCourseName() {
        return this.courseName;
    }
    getSchoolYearCourseWasTaken() {
        return this.schoolYearCourseWasTaken;
    }
    getStudentGradeLevelWhenTaken() {
        return this.studentGradeLevelWhenTaken;
    }
    getNumCredits() {
        return this.numCredits;
    }
    getRequirementPointValue() {
        return this.requirementPointValue;
    }
    getPossibleRequirementCodes() {
        return this.possibleRequirementCodes;
    }
    getCurrentRequirementCode() {
        return this.currentRequirementCode;
    }
}

class CompletedCourseRecord extends CourseRecord {
    constructor(studentName, courseCode, courseSection,
        courseName, courseLetterGrade, courseNumberGrade,
         teacherName,  schoolYearCourseWasTaken,  studentGradeLevelWhenTaken,
         credits,  requirementCode,  requirementPointValue) {
        super(studentName, courseCode, courseName, schoolYearCourseWasTaken, studentGradeLevelWhenTaken,
                credits, requirementCode, requirementPointValue);
          
        this.courseSection = courseSection;
        this.courseLetterGrade = courseLetterGrade;
        this.courseNumberGrade = courseNumberGrade;
        this.teacherName = teacherName;
    }
    getCourseSection() {
        return this.courseSection;
    }
    getCourseLetterGrade() {
        return this.courseLetterGrade;
    }
    getCourseNumberGrade() {
        return this.courseNumberGrade;
    }
    getTeacherName() {
        return this.teacherName;
    }
}

function populateStudentArrayFromJSON(json) {
    for (var i = 0; i < json.data.length; i++) {
        var nextStudent = new Student(json.data[i]['ID'], json.data[i]['Last Name'], json.data[i]['First Name'], json.data[i]['GR'], json.data[i]['Counselor Name']);
        var studentName = json.data[i]['Last Name'] + ', ' + json.data[i]['First Name'];
        var courseCode = json.data[i]['Course'];
        var section = json.data[i]['Sect'];
        var courseName = json.data[i]['Description'];
        var courseLetterGrade = json.data[i]['Final Grade'];
        var courseNumberGrade = json.data[i]['Final GB Ave'];
        var teacherName = json.data[i]['Teacher Names'];
        var schoolYearCourseWasTaken = json.data[i]['Course Year'];
        var studentGradeLevelWhenTaken = json.data[i]['Student GR'];
        var credits = json.data[i]['Credits'];
        var requirementCode = json.data[i]['Course Primary Subject'];
        var requirementPointValue = credits / 5;
        
        var courseRecord = new CompletedCourseRecord(studentName, courseCode, section, courseName, courseLetterGrade, courseNumberGrade, teacherName, schoolYearCourseWasTaken, studentGradeLevelWhenTaken, credits, requirementCode, requirementPointValue);

        nextStudent.addCompletedCourse(courseRecord);
        studentList.push(nextStudent);
    }
}

function populateCounselorListFromJSON(json) {
    for (var i = 0; i < json.data.length; i++) {
        counselorList.push(new Counselor(json.data[i]['Last Name'], json.data[i]['First Name']));
    }
}

function populateRequirementsFromJSON(json) {
    for (var i = 0; i < json.data.length; i++) {
        requirementList.push(new GraduationRequirement(json.data[i]['Requirement Name'], json.data[i]['Code'], json.data[i]['Points Needed']));
    }
}

function createSummaryTable() {

    var table = document.getElementById("gradreq_table");
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "gradreq_table";
    var tablearea = document.getElementById('summary-content');
    
    var thead = document.createElement("thead");
    var headRow = document.createElement('tr');

    var th1 = document.createElement('th');
    th1.scope = 'col';
    th1.onclick=function(){sortTable(0);}
    var thText1 = document.createTextNode('Category');
    th1.appendChild(thText1);
    
    var th2 = document.createElement('th');
    th2.scope = 'col';
    th2.onclick=function(){sortTable(1);}
    var thText2 = document.createTextNode('Code');
    th2.appendChild(thText2);
    
    var th3 = document.createElement('th');
    th3.scope = 'col';
    th3.onclick=function(){sortTable(2);}
    var thText3 = document.createTextNode('Earned');
    th3.appendChild(thText3);
    
    var th4 = document.createElement('th');
    th4.scope = 'col';
    th4.onclick=function(){sortTable(3);}
    var thText4 = document.createTextNode('Required');
    th4.appendChild(thText4);
    
    var th5 = document.createElement('th');
    th5.scope = 'col';
    th5.onclick=function(){sortTable(4);}
    var thText5 = document.createTextNode('Needed');
    th5.appendChild(thText5);

    headRow.appendChild(th1);
    headRow.appendChild(th2);
    headRow.appendChild(th3);
    headRow.appendChild(th4);
    headRow.appendChild(th5);

    thead.appendChild(headRow);
    newTable.appendChild(thead);

    for (var i = 1; i <= 5; i++) {

        var tr = document.createElement('tr');
        
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');
        
        var text1 = document.createTextNode('Text'+i);
        var text2 = document.createTextNode('Text'+i);
        var text3 = document.createTextNode('Text'+i);
        var text4 = document.createTextNode('Text'+i);
        var text5 = document.createTextNode('Text'+i);
        
        td1.appendChild(text1);
        td2.appendChild(text2);
        td3.appendChild(text3);
        td4.appendChild(text4);
        td5.appendChild(text5);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.onclick=function(){highlight_gradReq(this);}
        
        newTable.appendChild(tr);
    }
    tablearea.appendChild(newTable);
}