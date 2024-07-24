const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const {v4:uuidv4} = require('uuid')

const TableName = process.env.DYNAMODB_TABLE_NAME

exports.handler = async(event)=> {
    try {
        // parse the JSON data from the API Gateway POST request body
        const resume = JSON.parse(event.body);

        // generate a new unique id for the resume
        const id = uuidv4()

        // parse and import the json data into dynamodb
        await importToDynamoDB(resume, id)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Resume imported successfully!', id }),
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred while importing the resume.', error }),
        };
    }
}

async function importToDynamoDB(resume, id){
    // function to put items in DynamoDB
    const putItem = async (item) => {
        const params = {
            TableName: TableName,
            Item: item
        }
        await dynamodb.put(params).promise()
    }

    // insert basics
    const basics = resume.basics
    await putItem({
        id,
        sk: `basics#1`,
        name: basics.name,
        label: basics.label,
        image: basics.image,
        email: basics.email,
        phone: basics.phone,
        url: basics.url,
        summary: basics.summary,
        location: basics.location,
        profiles: basics.profiles
    })

    // insert work experiences 
    for (let i=0; i<resume.work.length; i++){
        const work = resume.work[i]
        await putItem({
            id,
            sk: `work#${i+1}`,
            name: work.name,
            position: work.position,
            startDate: work.startDate,
            endDate: work.endDate,
            highlights: work.highlights,
            summary: work.summary,
            url: work.url,
            location: work.location
        })
    }

    // insert volunteer experiences
    for (let i=0; i < resume.volunteer.length; i++){
        const volunteer = resume.volunteer[i]
        await putItem({
            id,
            sk: `volunteer#${i+1}`,
            organization: volunteer.organization,
            position: volunteer.position,
            startDate: volunteer.startDate,
            endDate: volunteer.endDate,
            summary: volunteer.summary,
            highlights: volunteer.highlights,
            url: volunteer.url
        })
    }

    // insert education details
    for (let i=0; i<resume.education.length; i++){
        const education = resume.education[i]
        await putItem({
            id,
            sk: `education#${i + 1}`,
            institution: education.institution,
            area: education.area,
            studyType: education.studyType,
            startDate: education.startDate,
            endDate: education.endDate,
            score: education.score,
            courses: education.courses
        })
    }

    // insert certificates
    for(let i=0; i < resume.certificates.length; i++){
        const certificate = resume.certificates[i]
        await putItem({
            id,
            sk: `certificates#${i+1}`,
            name: certificate.name,
            issuer: certificate.issuer,
            startDate: certificate.startDate,
            endDate: certificate.endDate,
            url: certificate.url
        })
    }

    // insert skills as a comma-delimited list of names
    const skillsList = resume.skills.map(skill => skill.name).join(', ')
    await putItem({
        id,
        sk: `skills#1`,
        item: skillsList
    })

    // insert languages
    for (let i=0; i<resume.languages.length; i++){
        const language = resume.languages[i]
        await putItem({
            id,
            sk: `languages#${i+1}`,
            language: language.language,
            fluency: language.fluency
        })
    }

    // insert projects as separate items
    for (let i=0; i<resume.projects.length; i++){
        const project = resume.projects[i]
        await putItem({
            id,
            sk: `projects#${i+1}`,
            name: project.name,
            startDate: project.startDate,
            summary: project.summary,
            url: project.url,
            endDate: project
        })
    }
}