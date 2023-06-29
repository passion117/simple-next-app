import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NextPage } from 'next';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import styles from '../styles/home.module.css';
import { useRouter } from 'next/router';


const Map: NextPage = () => {

  const [lat, setLat] = useState(27.672932021393862);
  const [lng, setLng] = useState(85.31184012689732);
  const libraries = useMemo(() => ['places'], []);
  const mapCenter = useMemo(() => ({ lat: lat, lng: lng }), [lat, lng]);
  const router = useRouter()

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: false,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries: libraries as any,
  });

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const backtoHome = () => {
    if (router.pathname !== '/home') {
      router.push('/home')
    }
  }

  return (
    <>
      <div className={styles.Map}>
        <div className={styles.Topbtn}>
          <div className={styles.floatBtn}>
            <span>鹿児島</span>
            <FontAwesomeIcon className={styles.icon} icon={faCaretDown} />
            <span>ユーザー数 :</span>
            <span>1234人</span>
          </div>
        </div>
        <PlacesAutocomplete
          onAddressSelect={(address) => {
            getGeocode({ address: address }).then((results) => {
              const { lat, lng } = getLatLng(results[0]);
              setLat(lat);
              setLng(lng);
            });
          }}
        />
        <p className={styles.notice}>長押しでピンを立てる</p>
        <GoogleMap
          onClick={() => backtoHome()}
          options={mapOptions}
          zoom={14}
          center={mapCenter}
          mapTypeId={google.maps.MapTypeId.ROADMAP}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={() => console.log('Map Component Loaded...')}
        />
        <MarkerF
          position={mapCenter}
          onLoad={() => console.log('Marker Loaded')}
        />
      </div>
    </>
  );
};

const PlacesAutocomplete = ({
  onAddressSelect,
}: {
  onAddressSelect?: (address: string) => void;
}) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'jp' } },
    debounce: 300,
    cache: 86400,
  });
  const renderSuggestions = () => {
    return data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
        description,
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={() => {
            setValue(description, false);
            clearSuggestions();
            onAddressSelect && onAddressSelect(description);
          }}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });
  };

  return (
    <div className={styles.autocompleteWrapper}>
      <input
        value={value}
        className={styles.autocompleteInput}
        disabled={!ready}
        onChange={(e) => setValue(e.target.value)}
        placeholder="123 Stariway To Heaven"
      />

      {status === 'OK' && (
        <ul className={styles.suggestionWrapper}>{renderSuggestions()}</ul>
      )}
    </div>
  );
};
export default Map;