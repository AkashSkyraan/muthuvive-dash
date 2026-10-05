import LocationForm from "../../components/SellPropertyForm/LocationForm/LocationForm";
import AgricultureLocationForm from "../../components/SellPropertyForm/LocationForm/AgricultureLocationForm";
import DetailForm from "../../components/SellPropertyForm/Detailform/DetailForm";
import AgricultureDetailForm from "../../components/SellPropertyForm/Detailform/AgricultureDetailForm";
import CommercialDetailForm from "../../components/SellPropertyForm/Detailform/CommercialDetailForm";
import FeatureForm from "../../components/SellPropertyForm/featuresForm/FeaturesForm";
import AgricultureFeatureForm from "../../components/SellPropertyForm/featuresForm/AgricultureFeatureForm";
import CommercialFeatureForm from "../../components/SellPropertyForm/featuresForm/CommercialFeatureForm";
import MediaForm from "../../components/SellPropertyForm/MediaForm/MediaForm";

export const categoryConfigMap = {
  1: "FarmLand",
  2: "DtcpApproved",
  3: "Agriculture Land",
  4: "Commercial Land",
  6: "Investment Land",
  7: "Commercial Buildings",
  8: "Residential Buildings",
};
export const sellPropertyFormConfig = {
  FarmLand: {
    location: LocationForm,
    details: DetailForm,
    features: FeatureForm,
    media: MediaForm,
  },

  DtcpApproved: {
    location: LocationForm,
    details: DetailForm,
    features: FeatureForm,
    media: MediaForm,
  },
  "Agriculture Land": {
    location: AgricultureLocationForm,
    details: AgricultureDetailForm,
    features: AgricultureFeatureForm,
    media: MediaForm,
  },
  "Commercial Land": {
    location: AgricultureLocationForm,
    details: CommercialDetailForm,
    features: CommercialFeatureForm,
    media: MediaForm,
  },
  "Investment Land": {
    location: AgricultureLocationForm,
    details: AgricultureDetailForm,
    features: AgricultureFeatureForm,
    media: MediaForm,
  },
  "Commercial Buildings": {
    location: AgricultureLocationForm,
    details: CommercialDetailForm,
    features: CommercialFeatureForm,
    media: MediaForm,
  },
  "Residential Buildings": {
    location: AgricultureLocationForm,
    details: CommercialDetailForm,
    features: CommercialFeatureForm,
    media: MediaForm,
  },
};
