package json

import (
	"encoding/json"
)

func Marshal(i interface{}) ([]byte, error) {
	return json.Marshal(&i)
}

func MarshalString(i interface{}) (string, error) {
	jsonBytes, err := Marshal(i)
	if err != nil {
		return "", err
	}

	return string(jsonBytes), nil
}

func Unmarshal(b []byte, i interface{}) error {
	return json.Unmarshal(b, &i)
}

func UnmarshalString(s string, i interface{}) error {
	return Unmarshal([]byte(s), i)
}
