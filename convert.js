/**
 * Created by kyon on 16-1-18.
 */
console.log('========== Convert Log ==========');
var fs= require('fs');
var markdown = require('markdown').markdown;
var moment = require('moment');
var path = '/home/kyon/WebstormProjects/ux_1452735360_1142263/';
var androidMDFile = path + 'android.md';
var androidTemplate = path + 'android_template.html';
var androidTarget = path + 'android.html';
var iosMDFile = path + 'ios.md';
var iosTemplate = path + 'ios_template.html';
var iosTarget = path + 'ios.html';

convertWork(androidMDFile,androidTemplate,androidTarget);
convertWork(iosMDFile,iosTemplate,iosTarget);

function convertWork(mdfile,tempFile,targetFile){
    fs.exists(mdfile,function(exists){
        if(exists){
            fs.exists(tempFile,function(exists1){
                if(exists1){
                    md2Html(mdfile,tempFile,targetFile);
                }else{
                    console.log('Error: ' + tempFile + ' not found!');
                }
            });
        }else{
            console.log('Error: ' + mdfile + ' not found!');
        }
    });
}

/**
 * convert markdown to html
 * @param tempFile    html template
 * @param mdFile
 * @param targetFile
 */
function md2Html(mdFile, tempFile,targetFile){
    console.log('Start to convert: ' + mdFile);
    var data = fs.readFileSync(mdFile,'utf-8');
    var html = markdown.toHTML(data);
    console.log('Convert ' + mdFile + ' complete!');
    makePage(html,tempFile,targetFile);
}

/**
 * Make html page & write to file
 * @param htmlText
 * @param tempFile
 * @param targetFile
 */
function makePage(htmlText,tempFile,targetFile){
    var template = fs.readFileSync(tempFile,'utf-8');
    var timeText = moment(new Date()).format('YYYY-MM-DD HH:mm');
    var targetHtml = template.replace('{$time}',timeText);
    targetHtml = targetHtml.replace('{$body}',htmlText);
    write2File(targetHtml,targetFile);
}

/**
 * write to file
 * @param text
 * @param targetFile
 */
function write2File(text, targetFile) {
    console.log('Write to ' + targetFile);
    fs.writeFile(targetFile, text, function (err) {
        if (err) {
            console.log("Write failed: " + err);
        }
    });
}

