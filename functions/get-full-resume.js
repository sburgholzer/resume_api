const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const id = event.pathParameters.id;
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
    };

    try {
        const data = await dynamodb.query(params).promise();
        if (data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Resume not found' }),
            };
        }

        const resume = assembleResume(data.Items);

        return {
            statusCode: 200,
            body: JSON.stringify(resume),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred while retrieving the resume.', error }),
        };
    }
};

function assembleResume(items) {
    const resume = {
        basics: {},
        work: [],
        volunteer: [],
        education: [],
        certificates: [],
        skills: [],
        languages: [],
        projects: [],
    };

    items.forEach(item => {
        const type = item.sk.split('#')[0];
        switch (type) {
            case 'basics':
                resume.basics = {
                    name: item.name,
                    label: item.label,
                    image: item.image,
                    email: item.email,
                    phone: item.phone,
                    url: item.url,
                    summary: item.summary,
                    location: item.location,
                    profiles: item.profiles,
                };
                break;
            case 'work':
                resume.work = resume.work || [];
                resume.work.push({
                    name: item.name,
                    position: item.position,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    highlights: item.highlights,
                    summary: item.summary,
                    url: item.url,
                    location: item.location,
                });
                break;
            case 'volunteer':
                resume.volunteer = resume.volunteer || [];
                resume.volunteer.push({
                    organization: item.organization,
                    position: item.position,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    summary: item.summary,
                    highlights: item.highlights,
                    url: item.url,
                });
                break;
            case 'education':
                resume.education = resume.education || [];
                resume.education.push({
                    institution: item.institution,
                    area: item.area,
                    studyType: item.studyType,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    score: item.score,
                    courses: item.courses,
                });
                break;
            case 'certificates':
                resume.certificates = resume.certificates || [];
                resume.certificates.push({
                    name: item.name,
                    issuer: item.issuer,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    url: item.url,
                });
                break;
            case 'skills':
                resume.skills = item.item.split(', ');
                break;
            case 'languages':
                resume.languages = resume.languages || [];
                resume.languages.push({
                    language: item.language,
                    fluency: item.fluency,
                });
                break;
            case 'projects':
                resume.projects = resume.projects || [];
                resume.projects.push({
                    name: item.name,
                    startDate: item.startDate,
                    summary: item.summary,
                    url: item.url,
                    endDate: item.endDate,
                });
                break;
            default:
                break;
        }
    });

    return resume;
}
