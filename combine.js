const { default: axios } = require("axios");
const fs = require("fs");

const collections = [
  // {
  //   id: "https://api.dc.library.northwestern.edu/api/v2/collections/faf4f60e-78e0-4fbf-96ce-4ca8b4df597a?as=iiif",
  //   label: "World War II Poster Collection",
  //   key: "ww2",
  // },
  {
    id: "https://api.dc.library.northwestern.edu/api/v2/search?query=%22Edward%20S.%20Curtis%27s%20The%20North%20American%20Indian%20--%20Volume%208.%20The%20Nez%20Perces.%20Wallawalla.%20Umatilla.%20Cayuse.%20The%20Chinookan%20tribes%22&as=iiif",
    label: "The Nez Percé",
    key: "nez-perce",
  },
  // {
  //   id: "https://api.dc.library.northwestern.edu/api/v2/collections/55ff2504-dd53-4943-b2cb-aeea46e77bc3?as=iiif",
  //   label: "Edward S. Curtis's The North American Indian",
  //   key: "curtis",
  // },
  // {
  //   id: "https://api.dc.library.northwestern.edu/api/v2/collections/c2a8a3e0-af0f-4e04-8721-91698fc14574?as=iiif",
  //   label: "Records of the Bursar’s Office Takeover, May 1968",
  //   key: "bursars",
  // },
  // {
  //   id: "https://api.dc.library.northwestern.edu/api/v2/collections/8cdf83c9-3831-4211-acd7-122bca9b89da?as=iiif",
  //   label: "Athletic Department Football Films",
  //   key: "football",
  // },
];

const getCollectionResponse = (url) => axios.get(url);

const getManifests = ({ manifests, id, label, key }) => {
  getCollectionResponse(id).then((response) => {
    const { items } = response.data;

    const next = items.find((item) => item.type === "Collection");
    const data = manifests.concat(
      items.filter((item) => item.type === "Manifest")
    );

    next?.id
      ? getManifests({ manifests: data, id: next?.id, label, key })
      : combineCollection(manifests, label, key);
  });
};

const combineCollection = (manifests, label, key) => {
  const output = `output/${key}.json`;
  const iiif = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    label: { none: [label] },
    id: `https://raw.githubusercontent.com/mathewjordan/combine/main/${output}`,
    type: "Collection",
    items: manifests,
  };

  fs.writeFile(
    output,
    JSON.stringify(iiif),
    (error) => error && console.error(error)
  );
};

const start = () => {
  collections.forEach((collection) =>
    getManifests({
      ...collection,
      manifests: [],
    })
  );
};

start();
