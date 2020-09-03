import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { Form, FormGroup, FormControl, FormLabel, Col } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import "./Projects.css";
import { s3Upload } from "../libs/awsLib";

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import MapGL from '@urbica/react-map-gl';
import Draw from '@urbica/react-map-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import center from '@turf/center'


export default function Projects() {
  const { id } = useParams();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState();
  const [title, setTitle] = useState("");
  const [cata, setCata] = useState(false);
  const [catc, setCatc] = useState(false);
  const [cate, setCate] = useState(false);
  const [cats, setCats] = useState(false);
  const [modea, setModea] = useState(false);
  const [modeb, setModeb] = useState(false);
  const [modet, setModet] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const imageFile = useRef(null);
  const [imageFileLabel, setImageFileLabel] = useState("Image file");
  const dataFile = useRef(null);
  const [dataFileLabel, setDataFileLabel] = useState("Data file");

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  const [viewport, setViewport] = React.useState({
    latitude: 28.058589, //29.15,
    longitude: -82.413983, //-82.5,
    zoom: 5.7,
    bearing: 0,
    pitch: 0,
  });
  const [geom, setGeom] = useState();


  useEffect(() => {
    function loadProject() {
      return API.get("projects", `/projects/${id}`);
    }

    async function onLoad() {
      try {
        const project = await loadProject();

        const { title, description, status, category, mode, district, lead, organization,
          startDate, endDate, location, geom, imageFiles, dataFiles } = project;

        if (imageFiles) {
          project.imageFilesURL = await Storage.get(imageFiles, {
            //level: "protected",
            identityId: project.userId
          });
        }
        if (dataFiles) {
          project.dataFilesURL = await Storage.get(dataFiles, {
            //level: "protected",
            identityId: project.userId
          });
        }

        setTitle(title);
        setStatus(status);
        if (description && description.blocks) {
          setEditorState(EditorState.createWithContent(convertFromRaw(description)));
        }
        if (category) {
          setCata(category.includes("a"));
          setCatc(category.includes("c"));
          setCate(category.includes("e"));
          setCats(category.includes("s"));
        }
        if (mode) {
          setModea(mode.includes("a"));
          setModeb(mode.includes("b"));
          setModet(mode.includes("t"));
        }
        if (lead) {
          setLeadName(lead.name);
          setLeadEmail(lead.email);
        }
        setOrganization(organization);
        if (startDate)
          setStartDate(startDate);
        if (endDate)
          setEndDate(endDate);

        if (geom && geom.features.length > 0) {
          setGeom(geom);
        }

        if (location && location.geometry && location.geometry.coordinates && location.geometry.coordinates[0]) {
          setViewport({
            latitude: location.geometry.coordinates[1],
            longitude: location.geometry.coordinates[0],
            zoom: 7.5
          });
        }

        setProject(project);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [id]);



  function validateForm() {
    return title.length > 0 && organization && organization.length > 0 &&
      (cata || catc || cate || cats) && (modea || modeb || modet) /*&&
      geom && geom.features.length > 0*/;
  }

  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
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
    var loc;
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
    return loc;
  }

  function saveProject(project) {
    return API.put("projects", `/projects/${id}`, {
      body: project
    });
  }

  async function handleSubmit(event) {
    let imagef, dataf;

    event.preventDefault();

    if ((imageFile.current && imageFile.current.size > config.MAX_ATTACHMENT_SIZE) ||
      (dataFile.current && dataFile.current.size > config.MAX_ATTACHMENT_SIZE)) {
      alert(
        `Please choose a file smaller than ${
        config.MAX_ATTACHMENT_SIZE / 1000000
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

      if (imageFile.current) {
        imagef = await s3Upload(imageFile.current);
      }
      if (dataFile.current) {
        dataf = await s3Upload(dataFile.current);
      }

      await saveProject({
        title: title,
        description: convertToRaw(editorState.getCurrentContent()),
        status: status,
        category: catArr,
        mode: modeArr,
        lead: {
          name: leadName,
          email: leadEmail
        },
        organization: organization,
        startDate: startDate,
        endDate: endDate,
        location: getProjectLocation(geom),
        geom: geom,
        dataFiles: dataf || project.dataFiles,
        imageFiles: imagef || project.imageFiles
      });

      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  function deleteProject() {
    return API.del("projects", `/projects/${id}`);
  }

  async function handleDelete(event) {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {

      //console.log(project.imageFiles);
      if (project.imageFiles) {
        await Storage.remove(project.imageFiles, {
          //level: "protected",
          identityId: project.userId
        });
      }

      //console.log(project.dataFiles);
      if (project.dataFiles) {
        await Storage.remove(project.dataFiles, {
          //level: "protected",
          identityId: project.userId
        });
      }

      await deleteProject();

      history.push("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }

  function handleMapDrawChange(event) {
    //console.log(event)
    //(data) => setGeom({ data })
    setGeom(event);
  }

  return (
    <div className="Projects">
      {project && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={e => setTitle(e.target.value)}
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
              <option value={config.projectStatus.IMPLEMENT}>Implementation</option>
              <option value={config.projectStatus.LIVE}>Live</option>
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
            <div>
              <MapGL {...viewport}
                style={{ width: '100%', height: '400px' }}
                mapStyle="mapbox://styles/mapbox/light-v10"
                accessToken={config.mapbox.TOKEN}
                onViewportChange={setViewport}
              >
                <Draw combineFeaturesControl={false} uncombineFeaturesControl={false} data={geom}
                  onChange={handleMapDrawChange} />
              </MapGL>
              <div>
                {geom != null && JSON.stringify(geom)}
              </div>
            </div>
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
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
            {/*             <div>
              {JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
            </div> */}
          </Form.Group>

          <Form.Group>
            <Form.Label>Image</Form.Label>
            {
              project.imageFiles &&
              <Form.Text>
                <span>Current file:&nbsp;</span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={project.imageFilesURL}
                >
                  {formatFilename(project.imageFiles)}
                </a>
              </Form.Text>
            }
            <Form.File controlId="imageFile" accept="image/*"
              label={imageFileLabel} custom onChange={handleImageFileChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Data</Form.Label>
            {
              project.dataFiles &&
              <Form.Text>
                <span>Current file:&nbsp;</span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={project.dataFilesURL}
                >
                  {formatFilename(project.dataFiles)}
                </a>
              </Form.Text>
            }
            <Form.File controlId="dataFile"
              label={dataFileLabel} custom onChange={handleDataFileChange} />
          </Form.Group>

          <LoaderButton style={{ marginTop: "50px" }}
            block
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Save
        </LoaderButton>

          <LoaderButton style={{ margin: "50px 0px" }}
            block
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>

        </Form>
      )}
    </div>
  );
}