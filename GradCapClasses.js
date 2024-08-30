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
        return this.isApprovedByOverride;
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
                // includes when there is a / but not if there is not since VPA includes PA
                if(this.completedCourses[j].currentRequirementCode.includes(gradReq)) {
                    // if(this.lastName === 'Katz')
                    //    console.log('Katz: ' + pointsForNext);
                    points += pointsForNext / 2;
                }
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
    hasMetCreditRequirement() {
        return this.getCreditsNeeded() <= 0;
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
    hasRequirementWarning() {
        return !this.hasMetAllGradRequirements() || !this.hasMetCreditRequirement();
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
    hasCompletedCourseWithMultipleGradRequirementOptions(reqCode) {
        for (const ccr of this.completedCourses)
            if(ccr.getCurrentRequirementCode().toLowerCase() === reqCode.toLowerCase() && ccr.getPossibleRequirementCodes().length > 1)
                return true;
        return false;
    }
}

//STUDENT GENERAL (static) FUNCTIONS
function getCurrentTotalInGrade(gradeLevel) {
    var total = 0;
    for(var i = 0; i < currentStudentList.length; i++)
        if(currentStudentList[i].getGradeLevel() == gradeLevel)
            total++;
    return total;
}
function getCurrentTotalStudentsWithWarnings() {
    var total = 0;
    for(var i = 0; i < currentStudentList.length; i++)
        if(!currentStudentList[i].hasRequirementWarning())
            total++;
    return total;
}
function getCurrentTotalStudentsWithOverrides() {
    var total = 0;
    for(var i = 0; i < currentStudentList.length; i++)
        if(currentStudentList[i].getIsApprovedByOverride())
            total++;
    return total;
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
        this.possibleRequirementCodes = requirementCode.split(';');
        //Default to the initial code if there are multiple
        // this.currentRequirementCode = requirementCode;
        this.currentRequirementCode = this.possibleRequirementCodes[0];
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
    setCurrentRequirementCode(reqCode) {
        this.currentRequirementCode = reqCode;
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
        var rawRequirementPrimary = json.data[i]['Course Primary Subj'];
        var rawRequirementSecondary = json.data[i]['CourseSecondarySubj'];
        
        //The requirementCode gets sent as a combination of the primary and secondary as long as the secondary is not "Electives"
        var requirementCode = getCodeFromPrimaryAndSecondarySubjectValues(rawRequirementPrimary, rawRequirementSecondary);
        // console.log(courseCode + ": " + requirementCode1);
        // var requirementCode = getReqCodeFromRawName(rawRequirementPrimary);

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

function getCodeFromPrimaryAndSecondarySubjectValues(primary, secondary) {
   if(secondary.toLowerCase().startsWith("elect") || secondary.toLowerCase() === primary.toLowerCase())
      return getReqCodeFromRawName(primary);
   else
      return getReqCodeFromRawName(primary) + ";" + getReqCodeFromRawName(secondary);
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
    // console.log("SUMMARY TABLE FOR: " + currentStudent.getNameLastFirst());
    var tableID = 'gradreq_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement("table");
    newTable.id = "gradreq_table";
    var tablearea = document.getElementById('summary-content');
    
    var thead = document.createElement("thead");
    var headRow = document.createElement('tr');

    var thHeaders = ['Category','Code','Earned','Required','Needed'];
    var isNumberData = [false, false, true, true, true];

    for(var i=0; i<thHeaders.length; i++) {
        var nextTH = document.createElement('th');
        nextTH.scope = 'col';
        const col = i;
        nextTH.onclick=function(){sortTable(col,tableID,1,isNumberData[i]);}
        var thText = document.createTextNode(thHeaders[i]);
        nextTH.appendChild(thText);
        headRow.appendChild(nextTH);
    }

    thead.appendChild(headRow);
    newTable.appendChild(thead);

    for (var i = 0; i < graduationRequirementList.length; i++) {
        // console.log("Creating summary table for " + currentStudent.getNameLastFirst() + " " + graduationRequirementList[i].code);

        var tr = document.createElement('tr');

        var cellText = [];
        
        var reqName = graduationRequirementList[i].getRequirementName();
        var reqPoints = graduationRequirementList[i].getRequiredTotalPoints();
        var gradCode = graduationRequirementList[i].code;
        var hasRequirementChangeOption = currentStudent.hasCompletedCourseWithMultipleGradRequirementOptions(gradCode);
        var pointsEarned = currentStudent.getPointsEarnedFor(gradCode);
        if(gradCode === 'CREDITS')
            pointsEarned = currentStudent.getCreditTotal();
        var pointsNeeded = currentStudent.getPointsNeededToMeetRequirement(gradCode)
        if(gradCode === 'CREDITS')
            pointsNeeded = currentStudent.getCreditsNeeded();
        if(pointsNeeded <= 0)
            pointsNeeded = '';

        cellText.push(document.createTextNode(reqName));
        var signalText = '';
        if(hasRequirementChangeOption)
            signalText = '*';
        cellText.push(document.createTextNode(gradCode + signalText));
        cellText.push(document.createTextNode(pointsEarned));
        cellText.push(document.createTextNode(reqPoints));
        cellText.push(document.createTextNode(pointsNeeded));

        for(var j=0; j<thHeaders.length; j++) {
            var nextData = document.createElement('td');
            nextData.appendChild(cellText[j]);
            if(j == 0) nextData.className = 'table-item-left-justify';
            tr.appendChild(nextData);
        }
        if(pointsNeeded > 0)
            tr.style.color = 'red';
        else
            tr.style.color = 'black';
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


//Use gradeLevel = 0 for a full history table (called 'transcript')
function createYearTable(gradeLevel) {

    var currentYearCourses = currentStudent.getCompletedCourses();

    if(gradeLevel !== 0) { //zero is for full transcript (all years)
        currentYearCourses = currentYearCourses.filter(obj => {
            return obj.getStudentGradeLevelWhenTaken() === gradeLevel;
        });
    }
    // console.log("NUM COURSES: " + currentYearCourses.length)

    
    var yearName = 'transcript';
    if(gradeLevel == 9)
        yearName = 'freshman';
    else if(gradeLevel == 10)
        yearName = 'sophomore';
    else if(gradeLevel == 11)
        yearName = 'junior';
    else if(gradeLevel == 12)
        yearName = 'senior';

    var tableID = yearName + '-course_table';
    var table = document.getElementById(tableID);
    table.remove();

    var initialTextDiv = document.getElementById(yearName + '-placeholder-text');
    initialTextDiv.style.display = 'none';

    var newTable = document.createElement('table');
    newTable.id = yearName + '-course_table';
    var tablearea = document.getElementById(yearName + '-content');

    if(currentYearCourses.length > 0) {
        
        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');
        
        var thHeaders = ['Yr','Course Name','Code','Req Met','Or','Pts','Credits','Avg','Grd','Teacher','Sect'];
        var isNumberData = [true,false,false,false,false,true,true,true,false,false,true];

        for(var i=0; i<thHeaders.length; i++) {
            nextTH = document.createElement('th');
            nextTH.scope = 'col';
            const col = i;
            nextTH.onclick=function(){sortTable(col,tableID,1,isNumberData[i]);}
            var thText = document.createTextNode(thHeaders[i]);
            nextTH.appendChild(thText);
            headRow.appendChild(nextTH);
        }
        
        thead.appendChild(headRow);
        newTable.appendChild(thead);

        for (var i = 0; i < currentYearCourses.length; i++) {
            
            var tr = document.createElement('tr');

            var cellText = [];

            cellText.push(document.createTextNode(currentYearCourses[i].getStudentGradeLevelWhenTaken()));
            cellText.push(document.createTextNode(currentYearCourses[i].getCourseName()));
            cellText.push(document.createTextNode(currentYearCourses[i].getCourseCode()));
            var currentReq = currentYearCourses[i].getCurrentRequirementCode();
            cellText.push(document.createTextNode(currentReq));
            // if(currentYearCourses[i].getPossibleRequirementCodes().length > 1)
            //     console.log(currentStudent.getNameLastFirst() + ' ' + currentYearCourses[i].getCourseCode() + ' ' + currentYearCourses[i].getPossibleRequirementCodes());
            var otherReqOption = '';
            var reqOption1 = currentYearCourses[i].getPossibleRequirementCodes()[0];
            var reqOption2 = currentYearCourses[i].getPossibleRequirementCodes()[1];
            if(currentYearCourses[i].getPossibleRequirementCodes().length > 1) {
                if(currentReq === reqOption1)
                    otherReqOption = reqOption2;
                else
                    otherReqOption = reqOption1;
            }
            cellText.push(document.createTextNode(otherReqOption));
            cellText.push(document.createTextNode(currentYearCourses[i].getRequirementPointValue()));
            cellText.push(document.createTextNode(currentYearCourses[i].getNumCredits()));
            cellText.push(document.createTextNode(currentYearCourses[i].getCourseNumberGrade()));
            cellText.push(document.createTextNode(currentYearCourses[i].getCourseLetterGrade()));
            cellText.push(document.createTextNode(currentYearCourses[i].getTeacherName()));
            cellText.push(document.createTextNode(currentYearCourses[i].getCourseSection()));

            
            for(var j=0; j<thHeaders.length; j++) {
                var nextData = document.createElement('td');
                nextData.appendChild(cellText[j]);
                if(j == 1 || j == 9)
                    nextData.className = 'table-item-left-justify';
                tr.appendChild(nextData);
            }
            
            tr.onclick=function(){highlight_course(this);}
            
            newTable.appendChild(tr);
        }
        tablearea.appendChild(newTable);
    }
    else { //this student has not courses this gradeLevel
        tablearea.appendChild(newTable);

        var initialTextDiv = document.getElementById(yearName + '-placeholder-text');
        initialTextDiv.style.display = 'block';
    }
}

//Use gradeLevel = 0 for history table ('transcript')
function clearYearTable(gradeLevel) {
    var yearName = 'transcript';
    if(gradeLevel == 9)
        yearName = 'freshman';
    else if(gradeLevel == 10)
        yearName = 'sophomore';
    else if(gradeLevel == 11)
        yearName = 'junior';
    else if(gradeLevel == 12)
        yearName = 'senior';

    var tableID = yearName + '-course_table';
    var table = document.getElementById(tableID);
    table.remove();
    var newTable = document.createElement('table');
    newTable.id = yearName + '-course_table';
    var tablearea = document.getElementById(yearName + '-content');
    tablearea.appendChild(newTable);
}






//OPTIMIZE THE GRAD REQUIREMENT IF OPTIONS EXIST
   //All CourseRecord objects MUST ALREADY HAVE A GRADUATION REQUIREMENT CODE ASSIGNED (I'm not sure why they wouldn't)
   //Determines how to assign a code to a course that has two possible codes (or more, eventually... if that's even possible).
   //A course that has the possibility of VPA;PA will decide the best to use based on the student's current transcript data.
   //AN ATTEMPT TO INCLUDE REQUEST DATA IN THE PROCESS WITH COMPLETED COURSE DATA
   //The useRequests parameter is true to include request data and false not to.
   function assignOptimalMultiCodeRequirementCourses(student, useRequests)
   {
      //A list of all records to be analyzed... records will be moved out of this list as they are processed
      var toBeProcessed = [];
      for(var i=0; i < student.getCompletedCourses().length; i++) {
        toBeProcessed.push(student.getCompletedCourses()[i]);
      }
      /** THIS IS THE BIG CHANGE... ADD COURSE REQUESTS.  **/
    //   if(useRequests)
    //      toBeProcessed.addAll(futureCourses);
      
      //A list for records as they get counted toward grad requirement totals
      var processed = [];
      
      //Move single option records to the processed list... correctly accounting for dual-code courses like ENG/HIST is done in getCurrentPointTotalFor
      for(var i = toBeProcessed.length - 1; i >= 0; i--)
         if(toBeProcessed[i].getPossibleRequirementCodes().length == 1) {
            var removed = toBeProcessed[i];
            toBeProcessed.splice(i, 1);
            processed.push(removed);
         }
    // if(toBeProcessed.length > 0){
    //     console.log(toBeProcessed[0]);
    //   console.log("Processing... num left = " + toBeProcessed.length + " " +  toBeProcessed[0].getCourseCode());
    //     }
    // else
    //   console.log("Processing... num left = " + toBeProcessed.length + " " +  toBeProcessed[0]);
      //At this point, only multi-code courses exist in the toBeProcessed list.
      //The processed list can be used to analyze the "current" totals of each requirement.
      //From the multi-code options, the course requirement with the most "need" will be assigned to each course as they get processed.
      //  - "Need" is based on (requiredPoints - earnedPoints)... the largest difference determines the "neediest".
      for(var i = toBeProcessed.length - 1; i >= 0; i--)
      {
          var nextCCRtoProcess = toBeProcessed[i];
        //   console.log("Processing... " + nextCCRtoProcess.code + " ... num found = " + toBeProcessed.length);
         //Get the list of possible grad requirement codes.
         var codes = nextCCRtoProcess.getPossibleRequirementCodes();
         //Determine the index of the requirement code with the greatest need.
         //USE THE PROCESSED LIST for this calculation, NOT the completedCourses list,
         //  since this algorithm is "building" the requirement assignment values, not using current ones.
         //Each code is currently assumed to be a single grad req code, not something combined with a "/"
         //  These were codes separated by ";"
         var currentMaxNeedPoints = 0;
         var currentMaxNeedIndex = 0;
         for(var j = 0; j < codes.length; j++)
         {
            var nextCode = codes[j];
            var pointsEarned = getCurrentPointTotalFor(nextCode, processed);

            var requirement = graduationRequirementList.find(obj => {
                return obj.code === nextCode;
            });
            // console.log("FOUND REQUIREMENT: " + requirement + " from " + nextCode);
            var pointsRequired = 0;
            if(typeof requirement !== 'undefined')
                pointsRequired = requirement.getRequiredTotalPoints();

            var pointsNeeded = pointsRequired - pointsEarned;
            //Determine if this is current "max need" index
            if(pointsNeeded > currentMaxNeedPoints) {
               currentMaxNeedPoints = pointsNeeded;
               currentMaxNeedIndex = j;
            }
         }
         //At this point, currentMaxNeedIndex represents the location of the optimal code to use.
         //Assign the calculated requirement code.
        //  console.log('Changing from ' + nextCCRtoProcess.getCurrentRequirementCode() + " to " + codes[currentMaxNeedIndex]);
         nextCCRtoProcess.setCurrentRequirementCode(codes[currentMaxNeedIndex]);
         //Move the processed course to the processed list
         var removed = toBeProcessed[i];
         toBeProcessed.splice(i, 1);
         processed.push(removed);
      }
      //All completed courses should now be completely accounted for and assigned optimal grad requirement codes.
      //Print a message in case something went wrong:
      if(toBeProcessed.length > 0)
         console.log("WARNING!!! Not all couurses were accounted for in the assignOptimalMultiCodeRequirementCourses method of the GraduationTracker class! Skipped... " + toBeProcessed);
    //    else
    //      console.log('Finished optimization of grad codes.');

   }
   
   //A HELPER METHOD for the assignOptimalMultiCodeRequirementCodes algorithm.
   //This is the EXACT same code as in getMyPointsEarnedFor, BUT this uses a list
   //  called "processed" that represents a portion of the completedCourses list as they get accounted for.
   //For the reqCode parameter, the return is the total number of points
   //CURRENTLY counted in the "processed" array... an array that IS NOT the completedCourses array,
   //  it is an array that is being populated as codes are assigned to multi-code courses.
   //The reqCode parameter MUST BE a SINGLE grad requirement code (should NOT contain a ";").
   //DEALING WITH DUAL-CODE COURSES (like Am. Studies with reqCode=ENG/HIST):
   //  - If reqCode parameter is "ENG/HIST" count as 1 ENG and 1 HIST, SEPARATELY!
   function getCurrentPointTotalFor(reqCode, processed) {
       var total = 0;
       for(var i=0; i < processed.length; i++)
       {
           var ccr = processed[i];
        //    console.log(ccr);
         //check for combo FIRST... count the "part" of the code that matches reqCode
         if(ccr.getCurrentRequirementCode().includes('/') //Slash means it counts for both requirement codes
               && ccr.getCurrentRequirementCode().toLowerCase().includes(reqCode.toLowerCase()))
            total += ccr.getRequirementPointValue() / 2.0; //Assumes ONLY DUAL course codes (not more) 
         //MUST USE ELSE so there is no double-counting of codes with "/"
         else if(ccr.getCurrentRequirementCode().toLowerCase() === reqCode.toLowerCase())
            total += ccr.getRequirementPointValue();
      }
      return total;
   }
   
