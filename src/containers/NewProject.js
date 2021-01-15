import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, FormGroup, FormControl, FormLabel, Col } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import "./NewProject.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import MapGL, { Popup } from '@urbica/react-map-gl';
import Draw from '@urbica/react-map-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { center, length, along } from '@turf/turf'


export default function NewProject() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState(config.projectStatus.PLAN);
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [cata, setCata] = useState(false);
  const [catc, setCatc] = useState(false);
  const [cate, setCate] = useState(false);
  const [cats, setCats] = useState(false);
  const [modea, setModea] = useState(false);
  const [modeb, setModeb] = useState(false);
  const [modet, setModet] = useState(false);
  const [leadName, setLeadName] = useState("");
  //const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const imageFile = useRef(null);
  const [imageFileLabel, setImageFileLabel] = useState("Image file");
  const dataFile = useRef(null);
  const [dataFileLabel, setDataFileLabel] = useState("Data file");
  const [statewide, setStatewide] = useState(false);

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  //28.058589, -82.413983
  const [viewport, setViewport] = React.useState({
    latitude: 28.058589, //29.15,
    longitude: -82.413983, //-82.5,
    zoom: 6.5,
    bearing: 0,
    pitch: 0,
  });
  const [geom, setGeom] = useState();


  function validateForm() {
    return title.length > 0 && organization.length > 0 &&
      (cata || catc || cate || cats) && (modea || modeb || modet) /*&&
      geom && geom.features.length > 0*/;
  }

  function handleImageFileChange(event) {
    imageFile.current = event.target.files[0];
    setImageFileLabel(imageFile.current ? imageFile.current.name : "Image file");
  }

  function handleDataFileChange(event) {
    dataFile.current = event.target.files[0];
    setDataFileLabel(dataFile.current ? dataFile.current.name : "Data file");
  }

  function getProjectLocation(geom) {
    /*var loc;
    if (geom && geom.features.length > 0) {
      loc = center(geom);
    } else {
      loc = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [-84.334687 + 0.12 * Math.random(), 30.397003 + 0.08 * Math.random()]
        }
      }
    }
    return loc;*/
    var loc;
    if (geom && geom.features.length > 0) {
      // if has point, use point
      // if has polygon, use center of polygon
      // else (linestrings), mid length
      var feature = geom.features[0];

      if (feature.geometry.type === "Point") {
        //console.log("point: " + feature.geometry.coordinates.toString());
        return feature;
      } else if (feature.geometry.type === "Polygon") {
        loc = center(feature);
        //console.log("Polygon: " + loc.geometry.coordinates.toString());
        return loc;
      } else if (feature.geometry.type === "LineString") {
        var len = length(feature);
        loc = along(feature, len / 2);
        //console.log("linestring: " + loc.geometry.coordinates.toString());
        return loc;
      }

      loc = center(geom);
    }
    return loc;
  }


  async function handleSubmit(event) {
    event.preventDefault();

    if ((imageFile.current && imageFile.current.size > config.MAX_ATTACHMENT_SIZE) ||
      (dataFile.current && dataFile.current.size > config.MAX_ATTACHMENT_SIZE)) {
      alert(
        `Please choose a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      let catArr = [];
      if (cata) catArr.push("a");
      if (catc) catArr.push("c");
      if (cate) catArr.push("e");
      if (cats) catArr.push("s");

      let modeArr = [];
      if (modea) modeArr.push("a");
      if (modeb) modeArr.push("b");
      if (modet) modeArr.push("t");

      const imagef = imageFile.current ? await s3Upload(imageFile.current) : null;
      const dataf = dataFile.current ? await s3Upload(dataFile.current) : null;
      console.log(imagef);
      console.log(dataf);

      await createProject({
        title: title,
        shortTitle: shortTitle,
        description: convertToRaw(editorState.getCurrentContent()),
        status: status,
        category: catArr,
        mode: modeArr,
        district: [],
        lead: {
          name: leadName,
          //phone: leadPhone,
          email: leadEmail
        },
        organization: organization,
        startDate: startDate,
        endDate: endDate,
        location: statewide ? null : getProjectLocation(geom),
        geom: statewide ? null : geom,
        dataFiles: dataf,
        imageFiles: imagef,
        statewide: statewide
      });

      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  function createProject(project) {
    return API.post("projects", "/projects", {
      body: project
    });
  }

  function handleMapDrawChange(event) {
    //console.log(event);
    //(data) => setGeom({ data })
    setGeom(event);
  }

  return (
    <div className="NewProject">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="shortTitle">
          <Form.Label>Short Title (for display in map view)</Form.Label>
          <Form.Control
            value={shortTitle}
            onChange={e => setShortTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="organization">
          <Form.Label>Organization</Form.Label>
          <Form.Control
            value={organization}
            onChange={e => setOrganization(e.target.value)}
          />
        </Form.Group>

        <Form.Row>
          <Form.Group as={Col} controlId="leadName">
            <Form.Label>Project Lead Name</Form.Label>
            <Form.Control
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
            />
          </Form.Group>
          {/* <Form.Group as={Col} controlId="leadPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              value={leadPhone}
              onChange={e => setLeadPhone(e.target.value)}
            />
          </Form.Group> */}
          <Form.Group as={Col} controlId="leadEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={leadEmail}
              onChange={e => setLeadEmail(e.target.value)}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              value={startDate} type="date"
              onChange={e => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              value={endDate} type="date"
              onChange={e => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Form.Row>

        <Form.Group controlId="status">
          <Form.Label>Status</Form.Label>
          <Form.Control as="select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value={config.projectStatus.PLAN}>Planning</option>
            <option value={config.projectStatus.DESIGN}>Design</option>
            <option value={config.projectStatus.DEPLOYMENT}>Deployment</option>
            <option value={config.projectStatus.EVALUATION}>Evaluation</option>
            <option value={config.projectStatus.DATA}>Data</option>
            <option value={config.projectStatus.OTHER}>Other</option>
          </Form.Control>
        </Form.Group>

        <Form.Row>
          <Form.Group as={Col} controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Check type="switch" id="categorya" label="Automated" checked={cata} onChange={e => setCata(e.target.checked)} />
            <Form.Check type="switch" id="categoryc" label="Connected" checked={catc} onChange={e => setCatc(e.target.checked)} />
            <Form.Check type="switch" id="categorye" label="Electric" checked={cate} onChange={e => setCate(e.target.checked)} />
            <Form.Check type="switch" id="categorys" label="Shared" checked={cats} onChange={e => setCats(e.target.checked)} />
          </Form.Group>
          <Form.Group as={Col} controlId="mode">
            <Form.Label>Mode</Form.Label>
            <Form.Check type="switch" id="modea" label="Auto" checked={modea} onChange={e => setModea(e.target.checked)} />
            <Form.Check type="switch" id="modeb" label="Bike" checked={modeb} onChange={e => setModeb(e.target.checked)} />
            <Form.Check type="switch" id="modet" label="Transit" checked={modet} onChange={e => setModet(e.target.checked)} />
          </Form.Group>
        </Form.Row>

        <Form.Group controlId="geom">
          <Form.Label>Location</Form.Label>
          <Form.Check type="switch" id="statewide" label="Statewide" checked={statewide} onChange={e => setStatewide(e.target.checked)} />
          <div>
            <MapGL {...viewport}
              style={{ width: '100%', height: '600px' }}
              mapStyle="mapbox://styles/mapbox/light-v10"
              accessToken={config.mapbox.TOKEN}
              onViewportChange={setViewport}
            >
              {!statewide &&
                <Draw combineFeaturesControl={false} uncombineFeaturesControl={false}
                  onChange={handleMapDrawChange} />
              }
            </MapGL>
            <div>
              {geom != null && JSON.stringify(geom)}
            </div>
          </div>
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          {/* <Form.Control
            value={description}
            as="textarea"
            onChange={e => setDescription(e.target.value)}
          /> */}
          <div>
            <Editor
              toolbar={{ options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'link', 'image'] }}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              editorState={editorState}
              onEditorStateChange={setEditorState}
              editorStyle={{ border: "1px solid #cdcdcd", padding: "5px", height: "250px", overflow: "auto" }}
            />
          </div>
          {/*           <div>
            {JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
          </div> */}
        </Form.Group>

        <Form.Group>
          <Form.Label>Image</Form.Label>
          <Form.File controlId="imageFile" accept="image/*"
            label={imageFileLabel} custom onChange={handleImageFileChange} />
        </Form.Group>

        <Form.Group>
          <Form.Label>Data</Form.Label>
          <Form.File controlId="dataFile"
            label={dataFileLabel} custom onChange={handleDataFileChange} />
        </Form.Group>

        <LoaderButton style={{ margin: "50px 0px" }}
          block
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </Form>

    </div>
  );
}
