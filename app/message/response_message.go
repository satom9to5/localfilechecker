package message

import (
	"fmt"
)

type ResponseMessage struct {
	Type    string `json:"type"`
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (rm ResponseMessage) String() string {
	return fmt.Sprintf("Type:%s, Success:%b, Message:%s", rm.Type, rm.Success, rm.Message)
}
