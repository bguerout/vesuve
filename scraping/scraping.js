const cheerio = require("cheerio");
const fs = require("fs-extra");
const request = require("superagent");

const getHtmlData = async (url) => {
  const response = await request
    .get(url)
    .set("Cookie", "men_default=idp8kof6f6obliehkd4bifp4ia");
  const html = response.text;
  return cheerio.load(html);
};

const createJsonFile = (object) => {
  const json = JSON.stringify(object);
  fs.writeFile("dataEtablissement.json", json);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  try {
    const $ = await getHtmlData(
      "https://www.education.gouv.fr/acce_public/search.php"
    );
    const numberEtablissement = $("#numfound").text();
    getInformationData(numberEtablissement);
  } catch (error) {
    console.log(error);
  }
})();

const getInformationData = async (numberEtablissement) => {
  const dataArray = [];
  try {
    for (let index = 1; index <= numberEtablissement; index++) {
      const $ = await getHtmlData(
        `https://www.education.gouv.fr/acce_public/uai.php?uai_mode=list&uai_ndx=${index}`
      );

      const adresseData = $(".colcentre").text();
      const emailTelephoneData = $(".colgauche").text();
      const nomEntrepriseUaiData = $(
        "#main > div:nth-child(2) > div.uai_form.clearfix > div.form1 > div.section > h1"
      ).text();
      const adresse = adresseData.split(":")[0].trim();
      const telephone = emailTelephoneData.split("M")[0].split(":")[1].trim();
      const email = emailTelephoneData.split(":")[2].split("T")[0].trim();
      const nomEntreprise = nomEntrepriseUaiData.split("-")[0].trim();
      const uai = nomEntrepriseUaiData.split("-")[1].trim();
      const dataEtablissement = {
        uai: uai,
        nom_entreprise: nomEntreprise,
        email: email,
        telephone: telephone,
        adresse: adresse,
      };
      dataArray.push(dataEtablissement);
    }
    await sleep(2000);
  } catch (error) {
    console.log(error);
  }
  createJsonFile(dataArray);
};
