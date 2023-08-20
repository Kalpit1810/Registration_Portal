const feesControl = async (req, res) => {
  const formData = req.body;

  console.log(formData);
  let category = "";
  let fee = 0;
  const Saarc = [
    "Afghanistan",
    "Bangladesh",
    "Bhutan",
    "India",
    "Maldives",
    "Nepal",
    "Pakistan",
    "Sri Lanka",
  ];
  const categoryFees = {
    SSM: 6500,
    SSN: 7200,
    SFM: 8400,
    SFN: 9600,
    SIM: 11000,
    SIN: 12100,
    NSN: 200,
    NFN: 4600,
    NIN: 550,
  };
  if (Saarc.includes(formData.country)) {
    category += "S";
  } else {
    category += "N";
  }

  if (formData.profile == "Student") {
    category += "S";
  } else if (formData.profile == "Faculty") {
    category += "F";
  } else if (formData.profile == "Research") {
    category += "I";
  }

  if (formData.isIshmtMember == "Yes") {
    category += "M";
  } else if (formData.isIshmtMember == "No") {
    category += "N";
  }
  console.log(
    categoryFees[category],
    1 + 0.25 * (Number(formData.paperCount) - 1),
    Number(formData.accompanyingPersons)
  );
  if (category[0] == "S") {
    fee =
      categoryFees[category] * (1 + 0.25 * (Number(formData.paperCount) - 1)) +
      3800 * Number(formData.accompanyingPersons);
  } else {
    fee =
      categoryFees[category] * (1 + 0.25 * (Number(formData.paperCount) - 1)) +
      180 * Number(formData.accompanyingPersons);
  }

  const currentTime = new Date();
  const givenTimeString = "2023-11-14T23:59:59"; // Replace this with your given time
  const givenTime = new Date(givenTimeString);

  if (currentTime > givenTime) {
    fee = fee * 1.25 * 1.18;
  } else {
    fee = fee * 1.18;
  }
  let updatedFormData;
  if (category[0] == "S") {
     updatedFormData = {
      ...formData,
      category: category,
      fee: `Rs ${fee}`,
    };
  } else {
     updatedFormData = {
      ...formData,
      category: category,
      fee: `$ ${fee}`,
    };
  }
  
  console.log("category and fee calculated");
  return res.json(updatedFormData);
};

const submitControl = async (req, res) => {

};

export { feesControl, submitControl };
