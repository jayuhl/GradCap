var studentList = [];
var counselorList = [];
var graduationRequirementList = []

var currentStudent, currentCounselor;
var currentStudentList = [];


class Student {
    constructor(id, lastName, firstName, gradeLevel, counselorName, completedCourses) {
        this.id = id;
        this.lastName = lastName;
        this.firstName = firstName;
        this.gradeLevel = Number(gradeLevel);
        this.counselorName = counselorName;
        this.completedCourses = completedCourses;
        // console.log("COMPLETED: " + completedCourses);
        this.isApprovedByOverride = false;
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
    getGradeLevel() {
        return this.gradeLevel;
    }
    getCounselorName() {
        return this.counselorName;
    }
    getIsApprovedByOverride() {
        return isApprovedByOverride;
    }
    getNameLastFirst() {
        return this.lastName + ", " + this.firstName;
    }
    getCompletedCourses() {
        return this.completedCourses;
    }
    setCompletedCourses(cc) {
        this.completedCourses = cc;
    }
    getPointsNeededToMeetRequirement(gradReq) {
        var requirement = graduationRequirementList.find(obj => {
            return obj.code === gradReq;
        });
        var reqPoints = requirement.getRequiredTotalPoints();
        return reqPoints - this.getPointsEarnedFor(gradReq);
    }
    getPointsEarnedFor(gradReq) {
        var points = 0;
        for(var j = 0; j < this.completedCourses.length; j++) {
            var pointsForNext = this.completedCourses[j].getRequirementPointValue();
            if(this.completedCourses[j].currentRequirementCode.includes('/')) {
                //se includes when there is a / but not if there is not since VPA includes PA
                if(this.completedCourses[j].currentRequirementCode.includes(gradReq))
                    pointsForNext = pointsForNext / 2;
            }
            else if(this.completedCourses[j].currentRequirementCode === gradReq) {
                points += pointsForNext;
            }
        }
        return points;
    }
    getCreditTotal() {
        var total = 0;
        for(var i = 0; i < this.completedCourses.length; i++)
            total += this.completedCourses[i].getNumCredits();
        return total;
    }
    getCreditsNeeded() {
        var creditRequirement = graduationRequirementList.find(obj => {
            return obj.code === 'CREDITS';
        });
        return creditRequirement.getRequiredTotalPoints() - this.getCreditTotal();
    }
    hasMetGradRequirement(reqCode) {
        var gradReq = graduationRequirementList.find(obj => {
            return obj.code === reqCode;
        });
        return this.getPointsEarnedFor(reqCode) >= gradReq.getRequiredTotalPoints();
    }
    hasMetAllGradRequirements() {
        var metAllRequirements = true;
        for(var i=0; i<graduationRequirementList.length; i++) {
            if(graduationRequirementList[i].code !== 'CREDITS') {
                if(!this.hasMetGradRequirement(graduationRequirementList[i].code))
                    metAllRequirements = false;
                // if(this.lastName === 'Friend')
                //     console.log(this.lastName + " " + graduationRequirementList[i].code + " " + this.hasMetGradRequirement(graduationRequirementList[i].code));
            }
        }
        return metAllRequirements;
    }
    getTotalNumMissingRequirements() {
        var total = 0;
        for(var i=0; i<graduationRequirementList.length; i++) {
            if(graduationRequirementList[i].code !== 'CREDITS') {
                var pts = this.getPointsNeededToMeetRequirement(graduationRequirementList[i].code);
                if(pts > 0)
                    total += pts;
            }
        }
        return total;
    }
}

class Counselor {
    static #nextID = 1001;
    constructor(lastName, firstName) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.id = Counselor.getNextID();
        Counselor.advanceID();
    }
    getLastName() {
        return this.lastName;
    }
    getFirstName() {
        return this.firstName;
    }
    getNameLastFirst() {
        return this.lastName + ", " + this.firstName;
    }
    static advanceID() {
        Counselor.#nextID++;
    }
    static getNextID() {
        return Counselor.#nextID;
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
        this.numCredits = Number(credits);
        this.requirementPointValue = requirementPointValue;
        // this.possibleRequirementCodes = requirementCode.split("\\s*;\\s*");
        this.possibleRequirementCodes = [];
        //Default to the initial code if there are multiple
        // this.currentRequirementCode = requirementCode;
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
        var studentName = json.data[i]['Last Name'] + ', ' + json.data[i]['First Name'];
        var courseCode = json.data[i]['Course'];
        var section = json.data[i]['Sect'];
        var courseName = json.data[i]['Description'];
        var courseLetterGrade = json.data[i]['Final Grade'];
        var courseNumberGrade = json.data[i]['Final GB Ave'];
        var teacherName = json.data[i]['Teacher Names'];
        var schoolYearCourseWasTaken = json.data[i]['Course Year'];
        var studentGradeLevelWhenTaken = Number(json.data[i]['Student GR']);
        var credits = json.data[i]['Credits'];
        var rawRequirement = json.data[i]['Course Primary Subj'];
        var requirementCode = getReqCodeFromRawName(rawRequirement);
        var requirementPointValue = credits / 5;
        if(credits == 6)
            requirementPointValue = 1;
        
        var courseRecord = new CompletedCourseRecord(studentName, courseCode, section, courseName, courseLetterGrade, courseNumberGrade, teacherName, schoolYearCourseWasTaken, studentGradeLevelWhenTaken, credits, requirementCode, requirementPointValue, completedCourses);

        var completedCourses = [courseRecord]; 

        var nextStudent = new Student(json.data[i]['ID'], json.data[i]['Last Name'], json.data[i]['First Name'], json.data[i]['GR'], json.data[i]['Counselor Name'], completedCourses);
        
        //Only add this student if they have not yet been added to the student list
        const index = studentList.findIndex(e => e.id === nextStudent.id);
        if (index == -1) {
            studentList.push(nextStudent);
            // console.log(nextStudent);
        }
        else { //otherwise just add this course record to the student's transcript data (completedCourses list)
            studentList[index].completedCourses.push(courseRecord);
        }
    }
    console.log("Student List length = " + studentList.length);

    //Sort courses by grade taken
    for(var i = 0; i < studentList.length; i++)
        studentList[i].completedCourses.sort(dynamicSort("studentGradeLevelWhenTaken"));

    currentStudentList = studentList;
}

function getReqCodeFromRawName(reqName) {
    if(reqName == 'English/History') return 'ENG/HIST';
    if(reqName == 'English') return 'ENG';
    if(reqName == 'Math') return 'MATH';
    if(reqName == 'Science') return 'SCI';
    if(reqName == 'World Languages') return 'WL';
    if(reqName == '21st Century Life & Careers') return 'PA';
    if(reqName == 'Phys. Ed. - Health') return 'PE';
    if(reqName == 'Social Studies') return 'HIST';
    if(reqName == 'Financial Literacy') return 'PFL';
    if(reqName == 'Visual or Performing Arts') return 'VPA';
    return 'ELECT';
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;

        //To sort by first property, then another...
        // obj.sort(function(a,b){
        //     if(a.last_nom< b.last_nom) return -1;
        //     if(a.last_nom >b.last_nom) return 1;
        //     if(a.first_nom< b.first_nom) return -1;
        //     if(a.first_nom >b.first_nom) return 1;
        //     return 0;
        // });
    }
}

function populateCounselorArrayFromJSON(json) {
    for (var i = 0; i < json.data.length; i++) {
        counselorList.push(new Counselor(json.data[i]['Last Name'], json.data[i]['First Name']));
    }
}

function populateCounselorListForPH() {
    var counselorLastNames = ['All Students','Casamento','Del Russo','Donnelly','Howard','Petzold','Schneider','Unassigned'];
    var counselorFirstNames = ['','Steven P','Valerie','Marin','Jenna','Alexa','Cristina',''];
    for (var i = 0; i < counselorLastNames.length; i++) {
        counselorList.push(new Counselor(counselorLastNames[i], counselorFirstNames[i]));
    }
    currentCounselor = counselorList[0];
}

function populateRequirementsFromJSON(json) {
    graduationRequirementList = [];
    for (var i = 0; i < json.data.length; i++) {
        graduationRequirementList.push(new GraduationRequirement(json.data[i]['Requirement Name'], json.data[i]['Code'], json.data[i]['Points Needed']));
    }
}

function populateRequirementsForPVRHSD() {
    var requirementNames = ['English','Math','History','Science','Language','Phys. Ed.','Visual or Performing Art','Practical Art','Personal Financial Literacy','Credits'];
    var requirementCodes = ['ENG','MATH','HIST','SCI','WL','PE','VPA','PA','PFL','CREDITS'];
    var requirementPoints = [4,3,3,3,2,4,1,1,0.5,120];
    for (var i = 0; i < requirementNames.length; i++) {
        graduationRequirementList.push(new GraduationRequirement(requirementNames[i], requirementCodes[i], requirementPoints[i]));
    }
}

function createSummaryTable() {

    var tableID = 'gradreq_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "gradreq_table";
    var tablearea = document.getElementById('summary-content');
    
    var thead = document.createElement("thead");
    var headRow = document.createElement('tr');

    var th0 = document.createElement('th');
    th0.scope = 'col';
    th0.onclick=function(){sortTable(0,tableID,1,false);}
    var thText0 = document.createTextNode('Category');
    th0.appendChild(thText0);
    
    var th1 = document.createElement('th');
    th1.scope = 'col';
    th1.onclick=function(){sortTable(1,tableID,1,false);}
    var thText1 = document.createTextNode('Code');
    th1.appendChild(thText1);
    
    var th2 = document.createElement('th');
    th2.scope = 'col';
    th2.onclick=function(){sortTable(2,tableID,1,true);}
    var thText2 = document.createTextNode('Earned');
    th2.appendChild(thText2);
    
    var th3 = document.createElement('th');
    th3.scope = 'col';
    th3.onclick=function(){sortTable(3,tableID,1,true);}
    var thText3 = document.createTextNode('Required');
    th3.appendChild(thText3);
    
    var th4 = document.createElement('th');
    th4.scope = 'col';
    th4.onclick=function(){sortTable(4,tableID,1,true);}
    var thText4 = document.createTextNode('Needed');
    th4.appendChild(thText4);

    headRow.appendChild(th0);
    headRow.appendChild(th1);
    headRow.appendChild(th2);
    headRow.appendChild(th3);
    headRow.appendChild(th4);

    thead.appendChild(headRow);
    newTable.appendChild(thead);

    for (var i = 0; i < graduationRequirementList.length; i++) {
        // console.log("Creating summary table for " + currentStudent.getNameLastFirst() + " " + graduationRequirementList[i].code);
        var tr = document.createElement('tr');
        
        var td0 = document.createElement('td');
        td0.className = 'table-item-left-justify';
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        
        var reqName = graduationRequirementList[i].getRequirementName();
        var reqPoints = graduationRequirementList[i].getRequiredTotalPoints();

        var text0 = document.createTextNode(reqName);

        var gradCode = graduationRequirementList[i].code;

        var text1 = document.createTextNode(gradCode);

        var pointsEarned = currentStudent.getPointsEarnedFor(gradCode);
        if(gradCode === 'CREDITS')
            pointsEarned = currentStudent.getCreditTotal();
        
        var text2 = document.createTextNode(pointsEarned);
        var text3 = document.createTextNode(reqPoints);
        var pointsNeeded = currentStudent.getPointsNeededToMeetRequirement(gradCode)
        if(gradCode === 'CREDITS')
            pointsNeeded = currentStudent.getCreditsNeeded();
        if(pointsNeeded <= 0)
            pointsNeeded = '';
        var text4 = document.createTextNode(pointsNeeded);
        
        td0.appendChild(text0);
        td1.appendChild(text1);
        td2.appendChild(text2);
        td3.appendChild(text3);
        td4.appendChild(text4);

        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.onclick=function(){highlight_gradReq(this);}
        
        newTable.appendChild(tr);
    }
    tablearea.appendChild(newTable);
    sortTable(4,tableID,-1,false);
}

function clearSummaryTable() {
    
    var tableID = 'gradreq_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "gradreq_table";
    var tablearea = document.getElementById('summary-content');
    tablearea.appendChild(newTable);
}

function createHistoryTable() {
    var tableID = 'transcript-course_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "transcript-course_table";
    var tablearea = document.getElementById('transcript-content');
    
    var thead = document.createElement("thead");
    var headRow = document.createElement('tr');

    var th0 = document.createElement('th');
    th0.scope = 'col';
    th0.onclick=function(){sortTable(0,tableID,1,true);}
    var thText0 = document.createTextNode('Yr');
    th0.appendChild(thText0);
    
    var th1 = document.createElement('th');
    th1.scope = 'col';
    th1.onclick=function(){sortTable(1,tableID,1,false);}
    var thText1 = document.createTextNode('Course Name');
    th1.appendChild(thText1);
    
    var th2 = document.createElement('th');
    th2.scope = 'col';
    th2.onclick=function(){sortTable(2,tableID,1,false);}
    var thText2 = document.createTextNode('Code');
    th2.appendChild(thText2);
    
    var th3 = document.createElement('th');
    th3.scope = 'col';
    th3.onclick=function(){sortTable(3,tableID,1,false);}
    var thText3 = document.createTextNode('Req Met');
    th3.appendChild(thText3);
    
    var th4 = document.createElement('th');
    th4.scope = 'col';
    th4.onclick=function(){sortTable(4,tableID,1,true);}
    var thText4 = document.createTextNode('Pts');
    th4.appendChild(thText4);

    var th5 = document.createElement('th');
    th5.scope = 'col';
    th5.onclick=function(){sortTable(5,tableID,1,true);}
    var thText5 = document.createTextNode('Credits');
    th5.appendChild(thText5);

    var th6 = document.createElement('th');
    th6.scope = 'col';
    th6.onclick=function(){sortTable(6,tableID,1,true);}
    var thText6 = document.createTextNode('Avg');
    th6.appendChild(thText6);

    var th7 = document.createElement('th');
    th7.scope = 'col';
    th7.onclick=function(){sortTable(7,tableID,1,false);}
    var thText7 = document.createTextNode('Teacher');
    th7.appendChild(thText7);

    var th8 = document.createElement('th');
    th8.scope = 'col';
    th8.onclick=function(){sortTable(8,tableID,1,true);}
    var thText8 = document.createTextNode('Sect');
    th8.appendChild(thText8);

    headRow.appendChild(th0);
    headRow.appendChild(th1);
    headRow.appendChild(th2);
    headRow.appendChild(th3);
    headRow.appendChild(th4);
    headRow.appendChild(th5);
    headRow.appendChild(th6);
    headRow.appendChild(th7);
    headRow.appendChild(th8);

    thead.appendChild(headRow);
    newTable.appendChild(thead);

    for (var i = 0; i < currentStudent.completedCourses.length; i++) {

        var tr = document.createElement('tr');
        
        var td0 = document.createElement('td');
        var td1 = document.createElement('td');
        td1.className = 'table-item-left-justify';
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');
        var td6 = document.createElement('td');
        var td7 = document.createElement('td');
        td7.className = 'table-item-left-justify';
        var td8 = document.createElement('td');
        
        var text0 = document.createTextNode(currentStudent.completedCourses[i].getStudentGradeLevelWhenTaken());
        var text1 = document.createTextNode(currentStudent.completedCourses[i].getCourseName());
        var text2 = document.createTextNode(currentStudent.completedCourses[i].getCourseCode());
        var text3 = document.createTextNode(currentStudent.completedCourses[i].getCurrentRequirementCode());
        var text4 = document.createTextNode(currentStudent.completedCourses[i].getRequirementPointValue());
        var text5 = document.createTextNode(currentStudent.completedCourses[i].getNumCredits());
        var text6 = document.createTextNode(currentStudent.completedCourses[i].getCourseNumberGrade());
        var text7 = document.createTextNode(currentStudent.completedCourses[i].getTeacherName());
        var text8 = document.createTextNode(currentStudent.completedCourses[i].getCourseSection());
        
        td0.appendChild(text0);
        td1.appendChild(text1);
        td2.appendChild(text2);
        td3.appendChild(text3);
        td4.appendChild(text4);
        td5.appendChild(text5);
        td6.appendChild(text6);
        td7.appendChild(text7);
        td8.appendChild(text8);

        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
        tr.appendChild(td8);
        tr.onclick=function(){highlight_course(this);}
        
        newTable.appendChild(tr);
    }
    tablearea.appendChild(newTable);
}

function clearHistoryTable() {
    var tableID = 'transcript-course_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "transcript-course_table";
    var tablearea = document.getElementById('transcript-content');
    tablearea.appendChild(newTable);
}
